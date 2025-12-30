import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MedicationService } from '../../shared/services/medication.service';
import { Medication } from '../../shared/models/medication.model';
import { RealTimeNotificationService } from '../../shared/services/real-time-notification.service';
import { ToastrService } from 'ngx-toastr';
import { DOSAGE_UNITS, FREQUENCIES } from '../models/medication-form.constants';
import { parseDosage, combineDosage } from '../models/medication.utils';
import { formatDateForInput, formatDateToLocalISO } from '../../shared/utils/date.utils';

@Component({
  selector: 'app-medication-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './medication-list.component.html',
  styleUrl: './medication-list.component.css'
})
export class MedicationListComponent implements OnInit, OnDestroy {
  medications: Medication[] = [];
  loading = true;
  errorMessage = '';
  showDeleteModal = false;
  medicationToDelete: Medication | null = null;
  showEditModal = false;
  medicationToEdit: Medication | null = null;
  editForm!: FormGroup;
  doseTimes: string[] = ['09:00'];

  readonly dosageUnits = DOSAGE_UNITS;
  readonly frequencies = FREQUENCIES;
  readonly quickDurationOptions = [
    { value: 3, label: '3 days' },
    { value: 5, label: '5 days' },
    { value: 7, label: '7 days' },
    { value: 10, label: '10 days' },
    { value: 14, label: '14 days' },
    { value: 21, label: '21 days' },
    { value: 30, label: '30 days' },
    { value: 60, label: '60 days' },
    { value: 90, label: '90 days' },
    { value: 180, label: '180 days' },
    { value: 365, label: '365 days' }
  ];

  private recommendationsReadyHandler: any;

  constructor(
    private medicationService: MedicationService,
    private realtimeService: RealTimeNotificationService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.initializeEditForm();
  }

  ngOnInit(): void {
    this.loadMedications();

    // Subscribe to real-time medication recommendations
    this.recommendationsReadyHandler = (payload: { medicationId: number, recommendations: string }) => {
      this.handleRecommendationsReady(payload);
    };
    this.realtimeService.on('MedicationRecommendationsReady', this.recommendationsReadyHandler);
  }

  ngOnDestroy(): void {
    if (this.recommendationsReadyHandler) {
      this.realtimeService.off('MedicationRecommendationsReady', this.recommendationsReadyHandler);
    }
  }

  loadMedications(): void {
    this.loading = true;
    this.medicationService.getMedications().subscribe({
      next: (medications) => {
        this.medications = medications;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load medications';
        this.loading = false;
      }
    });
  }

  openDeleteModal(medication: Medication): void {
    this.medicationToDelete = medication;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.medicationToDelete = null;
  }

  confirmDelete(): void {
    if (this.medicationToDelete) {
      this.medicationService.deleteMedication(this.medicationToDelete.medicationId).subscribe({
        next: () => {
          this.medications = this.medications.filter(m => m.medicationId !== this.medicationToDelete!.medicationId);
          this.closeDeleteModal();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to delete medication';
          this.closeDeleteModal();
        }
      });
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  private handleRecommendationsReady(payload: { medicationId: number, recommendations: string }): void {
    this.toastr.success('AI recommendations have been added!', 'Medication Updated');

    // Update local medication
    const index = this.medications.findIndex(m => m.medicationId === payload.medicationId);
    if (index !== -1) {
      this.medicationService.getMedication(payload.medicationId).subscribe({
        next: (updatedMed) => {
          this.medications[index] = updatedMed;
        }
      });
    }
  }

  parseNotesWithColorCoding(notes: string | undefined): Array<{ text: string, class: string }> {
    if (!notes) return [];

    return notes.split('\n').map(line => {
      if (line.includes('[RED]')) {
        return { text: line.replace('[RED]', '').trim(), class: 'text-red-600 font-semibold' };
      } else if (line.includes('[YELLOW]')) {
        return { text: line.replace('[YELLOW]', '').trim(), class: 'text-amber-600 font-semibold' };
      } else {
        return { text: line.trim(), class: 'text-slate-600' };
      }
    }).filter(item => item.text.length > 0);
  }

  // Edit Modal Methods
  private initializeEditForm(): void {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      dosageAmount: ['', [Validators.required, Validators.min(0.01)]],
      dosageUnit: ['mg', [Validators.required]],
      frequency: ['Once daily', [Validators.required]],
      startDate: ['', [Validators.required]],
      durationDays: ['', [Validators.min(1), Validators.max(365)]],
      notes: ['', [Validators.maxLength(5000)]] // Increased to 5000 for AI-generated recommendations
    });
  }

  openEditModal(medication: Medication): void {
    this.medicationToEdit = medication;
    const { amount, unit } = parseDosage(medication.dosage);

    // Parse dose times if available
    if (medication.doseTimes) {
      try {
        this.doseTimes = JSON.parse(medication.doseTimes);
      } catch {
        this.doseTimes = ['09:00'];
      }
    } else {
      this.doseTimes = ['09:00'];
    }

    // Calculate duration days if end date exists
    let durationDays = '';
    if (medication.endDate) {
      const startDate = new Date(medication.startDate);
      const endDate = new Date(medication.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      durationDays = diffDays.toString();
    }

    // Set form values
    this.editForm.setValue({
      name: medication.name || '',
      dosageAmount: amount || 0,
      dosageUnit: unit || 'mg',
      frequency: medication.frequency || 'Once daily',
      startDate: formatDateForInput(new Date(medication.startDate)),
      durationDays: durationDays || '',
      notes: medication.notes || ''
    });

    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.medicationToEdit = null;
    this.doseTimes = ['09:00'];
    this.editForm.reset({
      dosageUnit: 'mg',
      frequency: 'Once daily'
    });
  }

  confirmUpdate(): void {
    if (this.editForm.valid && this.medicationToEdit) {
      const formValue = this.editForm.value;
      const dosage = combineDosage(formValue.dosageAmount, formValue.dosageUnit);

      // Filter out empty dose times and convert to JSON
      const validDoseTimes = this.doseTimes.filter(time => time && time.trim() !== '');
      const doseTimesJson = validDoseTimes.length > 0 ? JSON.stringify(validDoseTimes) : null;

      // Calculate end date from start date + duration days
      let endDate = null;
      if (formValue.durationDays && formValue.durationDays !== '') {
        const durationDays = parseInt(formValue.durationDays, 10);
        const [year, month, day] = formValue.startDate.split('-').map(Number);
        const startDateObj = new Date(year, month - 1, day);
        startDateObj.setDate(startDateObj.getDate() + durationDays);
        endDate = formatDateToLocalISO(formatDateForInput(startDateObj));
      }

      const medicationPayload = {
        name: formValue.name,
        dosage: dosage,
        frequency: formValue.frequency,
        startDate: formatDateToLocalISO(formValue.startDate),
        endDate: endDate,
        notes: formValue.notes || null,
        doseTimes: doseTimesJson
      };

      this.medicationService.updateMedication(this.medicationToEdit.medicationId, medicationPayload).subscribe({
        next: () => {
          this.toastr.success('Medication updated successfully!', 'Success');
          this.loadMedications();
          this.closeEditModal();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to update medication';
          this.toastr.error(this.errorMessage, 'Error');
        }
      });
    }
  }

  addDoseTime(): void {
    this.doseTimes.push('09:00');
  }

  removeDoseTime(index: number): void {
    if (this.doseTimes.length > 1) {
      this.doseTimes.splice(index, 1);
    }
  }

  updateDoseTime(index: number, value: string): void {
    this.doseTimes[index] = value;
  }

  setQuickDuration(days: number): void {
    this.editForm.patchValue({ durationDays: days });
  }
}
