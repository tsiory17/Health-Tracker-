import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';
import { TimezoneService } from '../../shared/services/timezone.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  registeredEmail = '';
  showResendButton = false;
  resendingEmail = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private timezoneService: TimezoneService
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      // Auto-detect user's timezone using TimezoneService
      const windowsTimeZoneId = this.timezoneService.getCurrentWindowsTimezone();

      // Add timezone to registration data
      const registrationData = {
        ...this.registerForm.value,
        timeZoneId: windowsTimeZoneId
      };

      this.authService.register(registrationData).subscribe({
        next: (response) => {
          this.registeredEmail = response.email;
          // Redirect to login page with email pre-filled and success message
          this.router.navigate(['/login'], {
            queryParams: {
              email: this.registeredEmail,
              verified: 'pending'
            }
          });
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Registration failed';
          this.isLoading = false;
        }
      });
    }
  }

  resendVerificationEmail(): void {
    this.resendingEmail = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.resendVerification({ email: this.registeredEmail }).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.resendingEmail = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to resend verification email';
        this.resendingEmail = false;
      }
    });
  }
}
