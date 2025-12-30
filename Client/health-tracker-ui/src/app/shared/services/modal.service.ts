import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Medication } from '../models/medication.model';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private medicationDetailSubject = new BehaviorSubject<{ isOpen: boolean; medication: Medication | null }>({
    isOpen: false,
    medication: null
  });

  medicationDetail$: Observable<{ isOpen: boolean; medication: Medication | null }> =
    this.medicationDetailSubject.asObservable();

  openMedicationDetail(medication: Medication): void {
    this.medicationDetailSubject.next({ isOpen: true, medication });
  }

  closeMedicationDetail(): void {
    this.medicationDetailSubject.next({ isOpen: false, medication: null });
  }
}
