import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css'
})
export class VerifyEmailComponent implements OnInit {
  isVerifying = true;
  isSuccess = false;
  message = '';
  email = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    this.email = this.route.snapshot.queryParamMap.get('email') || '';

    if (!token) {
      this.isVerifying = false;
      this.isSuccess = false;
      this.message = 'Invalid verification link. No token provided.';
      return;
    }

    this.authService.verifyEmail({ token }).subscribe({
      next: (response) => {
        this.isVerifying = false;
        this.isSuccess = true;
        this.message = response.message;

        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: {
              email: this.email,
              verified: 'success'
            }
          });
        }, 3000);
      },
      error: (err) => {
        this.isVerifying = false;
        this.isSuccess = false;
        this.message = err.error?.message || 'Email verification failed. Please try again.';
      }
    });
  }
}
