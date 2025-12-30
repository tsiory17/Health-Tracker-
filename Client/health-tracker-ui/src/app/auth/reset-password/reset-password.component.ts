import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ResetPasswordRequest, ValidateResetTokenRequest } from '../../shared/models/user.model';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  isValidating: boolean = true;
  tokenValid: boolean = false;

  token: string = '';
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Extract token and email from query params
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.email = params['email'] || '';

      if (!this.token || !this.email) {
        this.errorMessage = 'Invalid reset link.';
        this.isValidating = false;
        return;
      }

      // Validate token on load
      this.validateToken();
    });
  }

  validateToken(): void {
    const request: ValidateResetTokenRequest = {
      token: this.token,
      email: this.email
    };

    this.authService.validateResetToken(request).subscribe({
      next: () => {
        this.tokenValid = true;
        this.isValidating = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Invalid or expired reset link.';
        this.tokenValid = false;
        this.isValidating = false;
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  get passwordMismatch(): boolean {
    return this.resetPasswordForm.hasError('passwordMismatch') &&
           this.resetPasswordForm.get('confirmPassword')?.touched || false;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: ResetPasswordRequest = {
      token: this.token,
      email: this.email,
      newPassword: this.resetPasswordForm.value.newPassword
    };

    this.authService.resetPassword(request).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.isLoading = false;
        this.resetPasswordForm.disable();

        // Auto-navigate to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'An error occurred. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
