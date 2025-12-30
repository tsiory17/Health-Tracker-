import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { UserMetricsService, UserMetrics } from '../shared/services/user-metrics.service';
import { MedicationService } from '../shared/services/medication.service';
import { MedicationLogService } from '../shared/services/medication-log.service';
import { User } from '../shared/models/user.model';
import { Medication } from '../shared/models/medication.model';
import { DosesSummary } from '../shared/models/medication-log.model';
import { MedicationCalendarComponent } from '../medications/medication-calendar/medication-calendar.component';
import { TodayComponent } from '../medications/today/today.component';
import { BmiChartComponent } from '../shared/bmi-chart/bmi-chart.component';
import { VitalsChartComponent } from '../shared/vitals-chart/vitals-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MedicationCalendarComponent, TodayComponent, BmiChartComponent, VitalsChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  userMetrics: UserMetrics | null = null;
  medications: Medication[] = [];
  hasMedications: boolean = false;
  medicationsLoading: boolean = true;
  todaysSummary: DosesSummary | null = null;
  summaryLoading: boolean = true;

  constructor(
    private authService: AuthService,
    private userMetricsService: UserMetricsService,
    private medicationService: MedicationService,
    private medicationLogService: MedicationLogService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.userMetricsService.getUserMetrics().subscribe({
      next: (metrics) => {
        this.userMetrics = metrics;
      },
      error: () => {}
    });

    // Load medications
    this.medicationService.getMedications().subscribe({
      next: (medications) => {
        this.medications = medications;
        this.hasMedications = medications.length > 0;
        this.medicationsLoading = false;
      },
      error: () => {
        this.medicationsLoading = false;
      }
    });

    // Load today's doses summary
    this.loadDosesSummary();

    // Listen for dose status changes and refresh summary
    this.medicationLogService.doseStatusChanged$.subscribe(() => {
      this.loadDosesSummary();
    });
  }

  loadDosesSummary(): void {
    this.medicationLogService.getDosesSummary().subscribe({
      next: (summary) => {
        this.todaysSummary = summary;
        this.summaryLoading = false;
      },
      error: () => {
        this.summaryLoading = false;
      }
    });
  }
}
