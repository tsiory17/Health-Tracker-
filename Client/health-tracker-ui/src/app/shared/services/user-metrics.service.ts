import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserMetricsRequest {
  dateOfBirth: string;
  heightCm: number;
  weightKg: number;
}

export interface UserMetrics {
  userMetricsId: number;
  userId: number;
  dateOfBirth: string;
  heightCm: number;
  weightKg: number;
  age: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserMetricsService {
  private apiUrl = `${environment.apiUrl}/usermetrics`;

  constructor(private http: HttpClient) { }

  saveUserMetrics(request: UserMetricsRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}`, request);
  }

  checkSetupStatus(): Observable<{ hasCompletedSetup: boolean }> {
    return this.http.get<{ hasCompletedSetup: boolean }>(`${this.apiUrl}/setup-status`);
  }

  getUserMetrics(): Observable<UserMetrics> {
    return this.http.get<UserMetrics>(`${this.apiUrl}`);
  }
}
