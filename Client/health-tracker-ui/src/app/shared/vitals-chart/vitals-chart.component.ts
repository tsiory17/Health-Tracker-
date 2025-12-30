import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VitalService } from '../services/vital.service';
import { Vital } from '../models/vital.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-vitals-chart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './vitals-chart.component.html',
  styleUrl: './vitals-chart.component.css',
  encapsulation: ViewEncapsulation.None
})
export class VitalsChartComponent implements OnInit, AfterViewInit {
  @ViewChild('bloodPressureChart') bpChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('heartRateChart') hrChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('weightChart') weightChartRef?: ElementRef<HTMLCanvasElement>;

  vitals: Vital[] = [];
  loading = true;
  hasVitals = false;
  latestVital: Vital | null = null;
  private viewInitialized = false;
  private bpChart: Chart | null = null;
  private hrChart: Chart | null = null;
  private weightChart: Chart | null = null;

  constructor(private vitalService: VitalService) {}

  ngOnInit(): void {
    this.loadVitals();
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    if (this.hasVitals) {
      setTimeout(() => this.createCharts(), 100);
    }
  }

  loadVitals(): void {
    this.vitalService.getVitals().subscribe({
      next: (vitals) => {
        this.vitals = vitals.sort((a, b) =>
          new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
        );
        this.hasVitals = this.vitals.length > 0;
        this.latestVital = vitals.length > 0 ? vitals[vitals.length - 1] : null;
        this.loading = false;
        if (this.viewInitialized && this.hasVitals) {
          setTimeout(() => this.createCharts(), 100);
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getHeartRateStatus(): string {
    if (!this.latestVital?.heartRate) return '';
    const hr = this.latestVital.heartRate;
    if (hr >= 60 && hr <= 100) return 'green';
    if (hr > 100 && hr <= 120) return 'yellow';
    return 'red';
  }

  getHeartRateMessage(): string {
    if (!this.latestVital?.heartRate) return 'No data';
    const hr = this.latestVital.heartRate;
    if (hr >= 60 && hr <= 100) return 'Normal range';
    if (hr > 100 && hr <= 120) return 'Slightly elevated';
    return 'Outside typical range';
  }

  getBloodPressureStatus(): string {
    if (!this.latestVital?.bloodPressureSystolic || !this.latestVital?.bloodPressureDiastolic) return '';
    const sys = this.latestVital.bloodPressureSystolic;
    const dia = this.latestVital.bloodPressureDiastolic;
    if (sys < 120 && dia < 80) return 'green';
    if (sys >= 120 && sys < 130 && dia < 80) return 'yellow';
    if (sys >= 130 || dia >= 80) return 'red';
    return '';
  }

  getBloodPressureMessage(): string {
    if (!this.latestVital?.bloodPressureSystolic || !this.latestVital?.bloodPressureDiastolic) return 'No data';
    const sys = this.latestVital.bloodPressureSystolic;
    const dia = this.latestVital.bloodPressureDiastolic;
    if (sys < 120 && dia < 80) return 'Normal';
    if (sys >= 120 && sys < 130 && dia < 80) return 'Elevated';
    if (sys >= 130 || dia >= 80) return 'Above recommended range';
    return '';
  }

  hasBloodPressureData(): boolean {
    return this.vitals.filter(v => v.bloodPressureSystolic != null && v.bloodPressureDiastolic != null).length > 0;
  }

  hasHeartRateData(): boolean {
    return this.vitals.filter(v => v.heartRate != null).length > 0;
  }

  hasWeightData(): boolean {
    return this.vitals.filter(v => v.weight != null).length > 0;
  }

  createCharts(): void {
    if (!this.viewInitialized || this.vitals.length === 0) {
      return;
    }

    // Modern Chart Configuration
    const modernChartDefaults = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index' as const,
      },
      plugins: {
        legend: {
          display: true,
          position: 'top' as const,
          align: 'end' as const,
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 15,
            font: {
              size: 12,
              weight: 600,
              family: "'Manrope', sans-serif"
            },
            color: '#4b5563'
          }
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
          borderWidth: 1
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: {
            color: '#f3f4f6'
          },
          ticks: {
            font: {
              size: 11,
              family: "'Manrope', sans-serif"
            },
            color: '#9ca3af',
            padding: 8
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
    };

    // Blood Pressure Chart
    const bpVitals = this.vitals.filter(v => v.bloodPressureSystolic && v.bloodPressureDiastolic);
    if (bpVitals.length > 0 && this.bpChartRef && this.bpChartRef.nativeElement) {
      const bpLabels = bpVitals.map(v =>
        new Date(v.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      );
      const ctx = this.bpChartRef.nativeElement.getContext('2d');
      if (ctx) {
        if (this.bpChart) this.bpChart.destroy();

        const gradient1 = ctx.createLinearGradient(0, 0, 0, 300);
        gradient1.addColorStop(0, 'rgba(82, 183, 136, 0.25)');
        gradient1.addColorStop(1, 'rgba(82, 183, 136, 0)');

        const gradient2 = ctx.createLinearGradient(0, 0, 0, 300);
        gradient2.addColorStop(0, 'rgba(64, 145, 108, 0.25)');
        gradient2.addColorStop(1, 'rgba(64, 145, 108, 0)');

        this.bpChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: bpLabels,
            datasets: [
              {
                label: 'Systolic',
                data: bpVitals.map(v => v.bloodPressureSystolic!),
                borderColor: '#52b788',
                backgroundColor: gradient1,
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#52b788',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointHoverBackgroundColor: '#52b788',
                pointHoverBorderWidth: 3
              },
              {
                label: 'Diastolic',
                data: bpVitals.map(v => v.bloodPressureDiastolic!),
                borderColor: '#40916c',
                backgroundColor: gradient2,
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#40916c',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointHoverBackgroundColor: '#40916c',
                pointHoverBorderWidth: 3
              }
            ]
          },
          options: {
            ...modernChartDefaults,
            plugins: {
              ...modernChartDefaults.plugins,
              title: {
                display: true,
                text: 'Blood Pressure Trend',
                font: {
                  size: 15,
                  weight: 'bold',
                  family: "'Spectral', serif"
                },
                color: '#111827',
                padding: { bottom: 20 },
                align: 'start' as const
              }
            },
            scales: {
              ...modernChartDefaults.scales,
              y: {
                ...modernChartDefaults.scales.y,
                title: {
                  display: true,
                  text: 'mmHg',
                  font: {
                    size: 11,
                    weight: 600
                  },
                  color: '#6b7280'
                }
              }
            }
          }
        });
      }
    }

    // Heart Rate Chart
    const hrVitals = this.vitals.filter(v => v.heartRate);
    if (hrVitals.length > 0 && this.hrChartRef && this.hrChartRef.nativeElement) {
      const hrLabels = hrVitals.map(v =>
        new Date(v.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      );
      const ctx = this.hrChartRef.nativeElement.getContext('2d');
      if (ctx) {
        if (this.hrChart) this.hrChart.destroy();

        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(116, 198, 157, 0.3)');
        gradient.addColorStop(1, 'rgba(116, 198, 157, 0)');

        this.hrChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: hrLabels,
            datasets: [{
              label: 'Heart Rate',
              data: hrVitals.map(v => v.heartRate!),
              borderColor: '#74c69d',
              backgroundColor: gradient,
              borderWidth: 3,
              tension: 0.4,
              fill: true,
              pointBackgroundColor: '#74c69d',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7,
              pointHoverBackgroundColor: '#74c69d',
              pointHoverBorderWidth: 3
            }]
          },
          options: {
            ...modernChartDefaults,
            plugins: {
              ...modernChartDefaults.plugins,
              legend: { display: false },
              title: {
                display: true,
                text: 'Heart Rate Trend',
                font: {
                  size: 15,
                  weight: 'bold',
                  family: "'Spectral', serif"
                },
                color: '#111827',
                padding: { bottom: 20 },
                align: 'start' as const
              }
            },
            scales: {
              ...modernChartDefaults.scales,
              y: {
                ...modernChartDefaults.scales.y,
                title: {
                  display: true,
                  text: 'bpm',
                  font: {
                    size: 11,
                    weight: 600
                  },
                  color: '#6b7280'
                }
              }
            }
          }
        });
      }
    }

    // Weight Chart
    const weightVitals = this.vitals.filter(v => v.weight);
    if (weightVitals.length > 0 && this.weightChartRef && this.weightChartRef.nativeElement) {
      const weightLabels = weightVitals.map(v =>
        new Date(v.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      );
      const ctx = this.weightChartRef.nativeElement.getContext('2d');
      if (ctx) {
        if (this.weightChart) this.weightChart.destroy();

        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(149, 213, 178, 0.3)');
        gradient.addColorStop(1, 'rgba(149, 213, 178, 0)');

        this.weightChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: weightLabels,
            datasets: [{
              label: 'Weight',
              data: weightVitals.map(v => v.weight!),
              borderColor: '#95d5b2',
              backgroundColor: gradient,
              borderWidth: 3,
              tension: 0.4,
              fill: true,
              pointBackgroundColor: '#95d5b2',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7,
              pointHoverBackgroundColor: '#95d5b2',
              pointHoverBorderWidth: 3
            }]
          },
          options: {
            ...modernChartDefaults,
            plugins: {
              ...modernChartDefaults.plugins,
              legend: { display: false },
              title: {
                display: true,
                text: 'Weight Trend',
                font: {
                  size: 15,
                  weight: 'bold',
                  family: "'Spectral', serif"
                },
                color: '#111827',
                padding: { bottom: 20 },
                align: 'start' as const
              }
            },
            scales: {
              ...modernChartDefaults.scales,
              y: {
                ...modernChartDefaults.scales.y,
                title: {
                  display: true,
                  text: 'kg',
                  font: {
                    size: 11,
                    weight: 600
                  },
                  color: '#6b7280'
                }
              }
            }
          }
        });
      }
    }
  }
}
