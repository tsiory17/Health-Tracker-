import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VitalService } from '../../shared/services/vital.service';

@Component({
  selector: 'app-vitals-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './vitals-form.component.html',
  styleUrl: './vitals-form.component.css'
})
export class VitalsFormComponent implements OnInit {
  vitalForm!: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private vitalService: VitalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.vitalForm = this.fb.group({
      bloodPressureSystolic: [null, [Validators.min(0), Validators.max(300)]],
      bloodPressureDiastolic: [null, [Validators.min(0), Validators.max(200)]],
      heartRate: [null, [Validators.min(0), Validators.max(300)]],
      weight: [null, [Validators.min(0), Validators.max(1000)]]
    });
  }

  onSubmit(): void {
    if (this.vitalForm.invalid) {
      this.errorMessage = 'Please correct the form errors';
      return;
    }

    // Check if at least one field is filled
    const formValue = this.vitalForm.value;
    if (!formValue.bloodPressureSystolic &&
        !formValue.bloodPressureDiastolic &&
        !formValue.heartRate &&
        !formValue.weight) {
      this.errorMessage = 'Please enter at least one vital measurement';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    this.vitalService.createVital(formValue).subscribe({
      next: () => {
        this.successMessage = 'Vital signs recorded successfully!';
        this.vitalForm.reset();
        this.isSubmitting = false;

        // Redirect to dashboard after 1.5 seconds
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to record vital signs';
      }
    });
  }

  getHeartRateStatus(): string {
    const hr = this.vitalForm.get('heartRate')?.value;
    if (!hr) return '';

    if (hr >= 60 && hr <= 100) return 'green';
    if (hr > 100 && hr <= 120) return 'yellow';
    return 'red';
  }

  getHeartRateMessage(): string {
    const hr = this.vitalForm.get('heartRate')?.value;
    if (!hr) return '';

    if (hr >= 60 && hr <= 100) return 'Normal range';
    if (hr > 100 && hr <= 120) return 'Slightly elevated';
    return 'Outside typical range';
  }

  getBloodPressureStatus(): string {
    const sys = this.vitalForm.get('bloodPressureSystolic')?.value;
    const dia = this.vitalForm.get('bloodPressureDiastolic')?.value;

    if (!sys || !dia) return '';

    if (sys < 120 && dia < 80) return 'green';
    if (sys >= 120 && sys < 130 && dia < 80) return 'yellow';
    if (sys >= 130 || dia >= 80) return 'red';
    return '';
  }

  getBloodPressureMessage(): string {
    const sys = this.vitalForm.get('bloodPressureSystolic')?.value;
    const dia = this.vitalForm.get('bloodPressureDiastolic')?.value;

    if (!sys || !dia) return '';

    if (sys < 120 && dia < 80) return 'Normal';
    if (sys >= 120 && sys < 130 && dia < 80) return 'Elevated';
    if (sys >= 130 || dia >= 80) return 'High (Stage 1)';
    return '';
  }
}
