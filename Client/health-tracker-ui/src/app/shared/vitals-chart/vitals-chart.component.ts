import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VitalService } from '../services/vital.service';
import { Vital } from '../models/vital.model';

@Component({
  selector: 'app-vitals-chart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './vitals-chart.component.html',
  styleUrl: './vitals-chart.component.css'
})
export class VitalsChartComponent implements OnInit {
  vitals: Vital[] = [];
  loading = true;
  hasVitals = false;
  latestVital: Vital | null = null;

  constructor(private vitalService: VitalService) {}

  ngOnInit(): void {
    this.loadVitals();
  }

  loadVitals(): void {
    this.vitalService.getVitals().subscribe({
      next: (vitals) => {
        this.vitals = vitals.slice(0, 10).reverse();
        this.hasVitals = this.vitals.length > 0;
        this.latestVital = vitals.length > 0 ? vitals[0] : null;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load vitals', err);
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
}
