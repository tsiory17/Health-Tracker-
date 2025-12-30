import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { UserMetrics, UserMetricsService } from '../services/user-metrics.service';

Chart.register(...registerables);

@Component({
  selector: 'app-bmi-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bmi-chart.component.html',
  styleUrl: './bmi-chart.component.css',
  encapsulation: ViewEncapsulation.None
})
export class BmiChartComponent implements OnChanges, AfterViewInit, OnInit {
  @ViewChild('bmiChart') bmiChartRef!: ElementRef<HTMLCanvasElement>;
  @Input() userMetrics: UserMetrics | null = null;

  bmi: number = 0;
  bmiCategory: string = '';
  bmiColor: string = '';
  chart: Chart | null = null;
  private viewInitialized = false;
  metricsHistory: UserMetrics[] = [];

  constructor(private userMetricsService: UserMetricsService) {}

  ngOnInit(): void {
    this.loadMetricsHistory();
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    if (this.userMetrics) {
      this.calculateBMI();
      if (this.metricsHistory.length > 0) {
        this.createChart();
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userMetrics'] && this.userMetrics && this.viewInitialized) {
      this.calculateBMI();
      if (this.metricsHistory.length > 0) {
        this.createChart();
      }
    }
  }

  loadMetricsHistory(): void {
    this.userMetricsService.getUserMetricsHistory().subscribe({
      next: (history) => {
        this.metricsHistory = history;
        if (this.viewInitialized && this.userMetrics) {
          this.createChart();
        }
      },
      error: () => {
        if (this.viewInitialized && this.userMetrics) {
          this.createChart();
        }
      }
    });
  }

  calculateBMI(): void {
    if (this.userMetrics) {
      const heightInMeters = this.userMetrics.heightCm / 100;
      this.bmi = this.userMetrics.weightKg / (heightInMeters * heightInMeters);
      this.setBMICategory();
    }
  }

  setBMICategory(): void {
    if (this.bmi < 18.5) {
      this.bmiCategory = 'Underweight';
      this.bmiColor = 'yellow';
    } else if (this.bmi >= 18.5 && this.bmi < 25) {
      this.bmiCategory = 'Normal';
      this.bmiColor = 'green';
    } else if (this.bmi >= 25 && this.bmi < 30) {
      this.bmiCategory = 'Overweight';
      this.bmiColor = 'yellow';
    } else {
      this.bmiCategory = 'Obese';
      this.bmiColor = 'red';
    }
  }

  createChart(): void {
    if (!this.bmiChartRef || !this.userMetrics) return;

    const ctx = this.bmiChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.metricsHistory.length > 0
      ? this.metricsHistory.map(m => new Date(m.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      : ['Current'];

    const data = this.metricsHistory.length > 0
      ? this.metricsHistory.map(m => m.bmi)
      : [this.bmi];

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(82, 183, 136, 0.3)');
    gradient.addColorStop(1, 'rgba(82, 183, 136, 0)');

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'BMI',
          data: data,
          borderColor: '#52b788',
          backgroundColor: gradient,
          borderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: '#52b788',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverBorderWidth: 3,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'BMI Trend Over Time',
            font: {
              size: 15,
              weight: 'bold',
              family: "'Spectral', serif"
            },
            color: '#111827',
            padding: { bottom: 20 },
            align: 'start'
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            titleFont: {
              size: 13,
              weight: 600,
              family: "'Manrope', sans-serif"
            },
            bodyFont: {
              size: 13,
              family: "'Manrope', sans-serif"
            },
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
            usePointStyle: true,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                if (value === null) return '';
                let category = '';
                if (value < 18.5) category = 'Underweight';
                else if (value < 25) category = 'Normal';
                else if (value < 30) category = 'Overweight';
                else category = 'Obese';
                return `BMI: ${value.toFixed(1)} (${category})`;
              }
            }
          }
        },
        scales: {
          y: {
            min: 15,
            max: 40,
            ticks: {
              stepSize: 5,
              font: {
                size: 11,
                family: "'Manrope', sans-serif"
              },
              color: '#9ca3af',
              padding: 8
            },
            grid: {
              color: (context) => {
                const value = context.tick.value as number;
                if (value === 18.5 || value === 25 || value === 30) {
                  return 'rgba(107, 114, 128, 0.3)';
                }
                return '#f3f4f6';
              },
              lineWidth: (context) => {
                const value = context.tick.value as number;
                if (value === 18.5 || value === 25 || value === 30) {
                  return 2;
                }
                return 1;
              }
            },
            border: {
              display: false
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11,
                weight: 500,
                family: "'Manrope', sans-serif"
              },
              color: '#6b7280',
              padding: 8
            },
            border: {
              display: false
            }
          }
        }
      },
      plugins: [{
        id: 'colorZones',
        beforeDraw: (chart) => {
          const ctx = chart.ctx;
          const chartArea = chart.chartArea;
          const yScale = chart.scales['y'];

          const zones = [
            { min: 30, max: 40, color: 'rgba(239, 68, 68, 0.06)' },
            { min: 25, max: 30, color: 'rgba(251, 191, 36, 0.06)' },
            { min: 18.5, max: 25, color: 'rgba(82, 183, 136, 0.08)' },
            { min: 15, max: 18.5, color: 'rgba(251, 191, 36, 0.06)' }
          ];

          zones.forEach(zone => {
            const yTop = yScale.getPixelForValue(zone.max);
            const yBottom = yScale.getPixelForValue(zone.min);

            ctx.fillStyle = zone.color;
            ctx.fillRect(
              chartArea.left,
              yTop,
              chartArea.right - chartArea.left,
              yBottom - yTop
            );
          });
        }
      }]
    };

    this.chart = new Chart(ctx, config);
  }

  getBorderColor(): string {
    if (this.bmiColor === 'green') return '#52b788';
    if (this.bmiColor === 'yellow') return '#fbbf24';
    return '#ef4444';
  }

  getBackgroundColor(): string {
    if (this.bmiColor === 'green') return 'rgba(82, 183, 136, 0.2)';
    if (this.bmiColor === 'yellow') return 'rgba(251, 191, 36, 0.2)';
    return 'rgba(239, 68, 68, 0.2)';
  }
}
