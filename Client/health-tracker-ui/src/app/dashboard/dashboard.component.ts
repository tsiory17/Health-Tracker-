import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { UserMetricsService, UserMetrics } from '../shared/services/user-metrics.service';
import { MedicationService } from '../shared/services/medication.service';
import { User } from '../shared/models/user.model';
import { Medication } from '../shared/models/medication.model';
import { MedicationCalendarComponent } from '../medications/medication-calendar/medication-calendar.component';
import { BmiChartComponent } from '../shared/bmi-chart/bmi-chart.component';
import { VitalsChartComponent } from '../shared/vitals-chart/vitals-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MedicationCalendarComponent, BmiChartComponent, VitalsChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  userMetrics: UserMetrics | null = null;
  medications: Medication[] = [];
  hasMedications: boolean = false;
  medicationsLoading: boolean = true;

  constructor(
    private authService: AuthService,
    private userMetricsService: UserMetricsService,
    private medicationService: MedicationService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.userMetricsService.getUserMetrics().subscribe({
      next: (metrics) => {
        this.userMetrics = metrics;
      },
      error: (err) => {
        console.error('Failed to load user metrics', err);
      }
    });

    // Load medications
    this.medicationService.getMedications().subscribe({
      next: (medications) => {
        this.medications = medications;
        this.hasMedications = medications.length > 0;
        this.medicationsLoading = false;
      },
      error: (err) => {
        console.error('Failed to load medications', err);
        this.medicationsLoading = false;
      }
    });
  }
}
