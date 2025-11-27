import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vital } from '../models/vital.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VitalService {
  private apiUrl = `${environment.apiUrl}/vitals`;

  constructor(private http: HttpClient) {}

  getVitals(): Observable<Vital[]> {
    return this.http.get<Vital[]>(this.apiUrl);
  }

  getVital(id: number): Observable<Vital> {
    return this.http.get<Vital>(`${this.apiUrl}/${id}`);
  }

  createVital(vital: Partial<Vital>): Observable<Vital> {
    return this.http.post<Vital>(this.apiUrl, vital);
  }

  updateVital(id: number, vital: Partial<Vital>): Observable<Vital> {
    return this.http.put<Vital>(`${this.apiUrl}/${id}`, vital);
  }

  deleteVital(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
