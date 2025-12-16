import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { UserMetrics } from '../services/user-metrics.service';

Chart.register(...registerables);

@Component({
  selector: 'app-bmi-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bmi-chart.component.html',
  styleUrl: './bmi-chart.component.css'
})
export class BmiChartComponent implements OnChanges, AfterViewInit {
  @ViewChild('bmiChart') bmiChartRef!: ElementRef<HTMLCanvasElement>;
  @Input() userMetrics: UserMetrics | null = null;

  bmi: number = 0;
  bmiCategory: string = '';
  bmiColor: string = '';
  chart: Chart | null = null;
  private viewInitialized = false;

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    if (this.userMetrics) {
      this.calculateBMI();
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userMetrics'] && this.userMetrics && this.viewInitialized) {
      this.calculateBMI();
      this.createChart();
    }
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
    if (!this.bmiChartRef) return;

    const ctx = this.bmiChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: ['Current'],
        datasets: [{
          label: 'BMI',
          data: [this.bmi],
          borderColor: this.getBorderColor(),
          backgroundColor: this.getBackgroundColor(),
          pointRadius: 8,
          pointHoverRadius: 10,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                return value !== null ? `BMI: ${value.toFixed(1)} (${this.bmiCategory})` : '';
              }
            }
          }
        },
        scales: {
          y: {
            min: 15,
            max: 40,
            ticks: {
              stepSize: 5
            },
            grid: {
              color: (context) => {
                const value = context.tick.value as number;
                if (value === 18.5 || value === 25 || value === 30) {
                  return '#666';
                }
                return '#e0e0e0';
              },
              lineWidth: (context) => {
                const value = context.tick.value as number;
                if (value === 18.5 || value === 25 || value === 30) {
                  return 2;
                }
                return 1;
              }
            }
          },
          x: {
            grid: {
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
            { min: 30, max: 40, color: 'rgba(244, 67, 54, 0.1)' },
            { min: 25, max: 30, color: 'rgba(255, 215, 0, 0.1)' },
            { min: 18.5, max: 25, color: 'rgba(76, 175, 80, 0.1)' },
            { min: 15, max: 18.5, color: 'rgba(255, 215, 0, 0.1)' }
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
    if (this.bmiColor === 'green') return '#4caf50';
    if (this.bmiColor === 'yellow') return '#ffd700';
    return '#f44336';
  }

  getBackgroundColor(): string {
    if (this.bmiColor === 'green') return 'rgba(76, 175, 80, 0.2)';
    if (this.bmiColor === 'yellow') return 'rgba(255, 215, 0, 0.2)';
    return 'rgba(244, 67, 54, 0.2)';
  }
}
