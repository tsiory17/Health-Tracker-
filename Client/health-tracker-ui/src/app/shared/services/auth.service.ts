import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, RegisterRequest, AuthResponse, User, RegisterResponse, VerifyEmailRequest, ResendVerificationRequest, MessageResponse, ForgotPasswordRequest, ResetPasswordRequest, ValidateResetTokenRequest } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = this.getToken();
    if (token) {
      // Decode token and set current user
      const user = this.decodeToken(token);
      if (user) {
        this.currentUserSubject.next(user);
      }
    }
  }

  private decodeToken(token: string): User | null {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      const parsed = JSON.parse(decodedPayload);

      // Extract user information from token claims
      return {
        userId: parsed.userId || parsed.sub,
        username: parsed.username || parsed.unique_name,
        email: parsed.email,
        timeZoneId: parsed.timeZoneId || parsed.TimeZoneId || 'UTC'
      };
    } catch {
      return null;
    }
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, request);
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request)
      .pipe(
        tap(response => this.handleAuth(response))
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  private handleAuth(response: AuthResponse): void {
    if (response.token) {
      localStorage.setItem('token', response.token);
      this.currentUserSubject.next(response.user);
    }
  }

  verifyEmail(request: VerifyEmailRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/verify-email`, request);
  }

  resendVerification(request: ResendVerificationRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/resend-verification`, request);
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/forgot-password`, request);
  }

  validateResetToken(request: ValidateResetTokenRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/validate-reset-token`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/reset-password`, request);
  }

  updateProfile(timeZoneId: string): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.apiUrl}/update-profile`, { timeZoneId });
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
  updateCurrentUserTimezone(timeZoneId: string): void {
    const user = this.currentUserSubject.value;
    if (user) {
      const updatedUser = { ...user, timeZoneId };
      this.currentUserSubject.next(updatedUser);
    }
  }
}
 