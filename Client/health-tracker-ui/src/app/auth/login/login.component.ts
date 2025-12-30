import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';
import { UserMetricsService } from '../../shared/services/user-metrics.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  requiresVerification = false;
  resendingEmail = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userMetricsService: UserMetricsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Check for pre-filled email from registration or verification
    const emailParam = this.route.snapshot.queryParamMap.get('email');
    const verifiedParam = this.route.snapshot.queryParamMap.get('verified');

    if (emailParam) {
      this.loginForm.patchValue({ email: emailParam });

      if (verifiedParam === 'pending') {
        this.successMessage = 'Registration successful! Please check your email to verify your account before logging in.';
      } else if (verifiedParam === 'success') {
        this.successMessage = 'Email verified successfully! You can now log in.';
      }
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.errorMessage = '';
      this.successMessage = '';
      this.requiresVerification = false;

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.userMetricsService.checkSetupStatus().subscribe({
            next: (response) => {
              if (response.hasCompletedSetup) {
                this.router.navigate(['/home']);
              } else {
                this.router.navigate(['/setup']);
              }
            },
            error: () => {
              this.router.navigate(['/setup']);
            }
          });
        },
        error: (err) => {
          if (err.error?.requiresVerification) {
            this.requiresVerification = true;
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = err.error?.message || 'Login failed';
          }
        }
      });
    }
  }

  resendVerificationEmail(): void {
    const email = this.loginForm.get('email')?.value;
    if (!email) {
      this.errorMessage = 'Please enter your email address';
      return;
    }

    this.resendingEmail = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.resendVerification({ email }).subscribe({
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
