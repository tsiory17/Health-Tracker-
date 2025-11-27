import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserMetricsRequest {
  dateOfBirth: string;
  heightCm: number;
  weightKg: number;
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
}
