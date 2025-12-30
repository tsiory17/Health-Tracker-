import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  MedicationDoseResponse,
  DosesSummary,
  UpdateDoseStatusRequest
} from '../models/medication-log.model';

@Injectable({
  providedIn: 'root'
})
export class MedicationLogService {
  private apiUrl = `${environment.apiUrl}/medication-logs`;

  // Subject to notify when dose status changes
  private doseStatusChanged = new Subject<void>();
  public doseStatusChanged$ = this.doseStatusChanged.asObservable();

  constructor(private http: HttpClient) {}

  getTodaysDoses(date?: Date): Observable<MedicationDoseResponse[]> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date.toISOString().split('T')[0]);
    }
    return this.http.get<MedicationDoseResponse[]>(`${this.apiUrl}/today`, { params });
  }

  markDoseAsTaken(doseId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${doseId}/take`, {}).pipe(
      tap(() => this.doseStatusChanged.next())
    );
  }

  updateDoseStatus(doseId: number, request: UpdateDoseStatusRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${doseId}`, request).pipe(
      tap(() => this.doseStatusChanged.next())
    );
  }

  getDosesSummary(date?: Date): Observable<DosesSummary> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date.toISOString().split('T')[0]);
    }
    return this.http.get<DosesSummary>(`${this.apiUrl}/summary`, { params });
  }

  getUserToday(): Observable<{ date: string }> {
    return this.http.get<{ date: string }>(`${this.apiUrl}/user-today`);
  }
}
