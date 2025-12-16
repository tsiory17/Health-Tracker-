import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserMetricsService } from '../shared/services/user-metrics.service';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './setup.component.html',
  styleUrl: './setup.component.css'
})
export class SetupComponent {
  setupForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private userMetricsService: UserMetricsService,
    private router: Router
  ) {
    this.setupForm = this.fb.group({
      dateOfBirth: ['', [Validators.required, this.ageValidator]],
      heightCm: ['', [Validators.required, Validators.min(0.01)]],
      weightKg: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  ageValidator(control: any) {
    if (!control.value) return null;

    const dob = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age < 1 ? { minAge: true } : null;
  }

  onSubmit(): void {
    if (this.setupForm.valid) {
      this.userMetricsService.saveUserMetrics(this.setupForm.value).subscribe({
        next: () => this.router.navigate(['/home']),
        error: (err) => this.errorMessage = err.error?.message || 'Setup failed'
      });
    }
  }
}
