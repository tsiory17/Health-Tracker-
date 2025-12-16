import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userMetricsService: UserMetricsService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
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
        error: (err) => this.errorMessage = err.error?.message || 'Login failed'
      });
    }
  }
}
