import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medication, MedicationDose } from '../models/medication.model';
import { MedicationDto } from '../../medications/models/medication-dto.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MedicationService {
  private apiUrl = `${environment.apiUrl}/medications`;

  constructor(private http: HttpClient) {}

  getMedications(): Observable<Medication[]> {
    return this.http.get<Medication[]>(this.apiUrl);
  }

  getMedication(id: number): Observable<Medication> {
    return this.http.get<Medication>(`${this.apiUrl}/${id}`);
  }

  createMedication(medication: MedicationDto): Observable<Medication> {
    return this.http.post<Medication>(this.apiUrl, medication);
  }

  updateMedication(id: number, medication: MedicationDto): Observable<Medication> {
    return this.http.put<Medication>(`${this.apiUrl}/${id}`, medication);
  }

  deleteMedication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getDoses(medicationId: number): Observable<MedicationDose[]> {
    return this.http.get<MedicationDose[]>(`${this.apiUrl}/${medicationId}/doses`);
  }

  markDoseAsTaken(doseId: number): Observable<MedicationDose> {
    return this.http.patch<MedicationDose>(`${this.apiUrl}/doses/${doseId}/take`, {});
  }
}
