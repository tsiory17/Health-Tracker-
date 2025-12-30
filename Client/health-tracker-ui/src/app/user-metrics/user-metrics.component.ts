import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserMetricsService, UserMetrics } from '../shared/services/user-metrics.service';
import { BmiChartComponent } from '../shared/bmi-chart/bmi-chart.component';
import { VitalsChartComponent } from '../shared/vitals-chart/vitals-chart.component';

@Component({
  selector: 'app-user-metrics',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BmiChartComponent, VitalsChartComponent],
  templateUrl: './user-metrics.component.html',
  styleUrl: './user-metrics.component.css'
})
export class UserMetricsComponent implements OnInit {
  metricsForm: FormGroup;
  userMetrics: UserMetrics | null = null;
  errorMessage = '';
  successMessage = '';
  loading = true;
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private userMetricsService: UserMetricsService
  ) {
    this.metricsForm = this.fb.group({
      heightCm: ['', [Validators.required, Validators.min(0.01)]],
      weightKg: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    this.loadUserMetrics();
  }

  loadUserMetrics(): void {
    this.userMetricsService.getUserMetrics().subscribe({
      next: (metrics) => {
        this.userMetrics = metrics;
        this.metricsForm.patchValue({
          heightCm: metrics.heightCm,
          weightKg: metrics.weightKg
        });
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load user metrics';
        this.loading = false;
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Reset form if canceling
      this.metricsForm.patchValue({
        heightCm: this.userMetrics?.heightCm,
        weightKg: this.userMetrics?.weightKg
      });
    }
  }

  onSubmit(): void {
    if (this.metricsForm.valid && this.userMetrics) {
      const request = {
        dateOfBirth: this.userMetrics.dateOfBirth,
        heightCm: this.metricsForm.value.heightCm,
        weightKg: this.metricsForm.value.weightKg
      };

      this.userMetricsService.updateUserMetrics(request).subscribe({
        next: (updatedMetrics) => {
          this.userMetrics = updatedMetrics;
          this.successMessage = 'Metrics updated successfully!';
          this.isEditing = false;
          this.errorMessage = '';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to update metrics';
          this.successMessage = '';
        }
      });
    }
  }

  calculateBMI(): number {
    if (!this.userMetrics) return 0;
    const heightInMeters = this.userMetrics.heightCm / 100;
    return this.userMetrics.weightKg / (heightInMeters * heightInMeters);
  }
}
