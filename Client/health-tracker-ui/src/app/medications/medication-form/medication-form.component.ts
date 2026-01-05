import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MedicationService } from '../../shared/services/medication.service';
import { DOSAGE_UNITS, FREQUENCIES } from '../models/medication-form.constants';
import { parseDosage, combineDosage } from '../models/medication.utils';
import { formatDateForInput, formatDateToLocalISO } from '../../shared/utils/date.utils';

@Component({
  selector: 'app-medication-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './medication-form.component.html',
  styleUrl: './medication-form.component.css'
})
export class MedicationFormComponent implements OnInit {
  medicationForm: FormGroup;
  errorMessage = '';
  isEditMode = false;
  medicationId: number | null = null;
  doseTimes: string[] = ['09:00']; // Default to one dose time at 9:00 AM

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

  constructor(
    private fb: FormBuilder,
    private medicationService: MedicationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.medicationForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      dosageAmount: ['', [Validators.required, Validators.min(0.01)]],
      dosageUnit: ['mg', [Validators.required]],
      frequency: ['Once daily', [Validators.required]],
      startDate: [formatDateForInput(new Date()), [Validators.required, this.noPastDateValidator]],
      durationDays: ['', [Validators.min(1), Validators.max(365)]],
      notes: ['', [Validators.maxLength(5000)]] // Increased to 5000 for AI-generated recommendations
    });
  }

  // Method to set duration from quick select dropdown
  setQuickDuration(days: number): void {
    this.medicationForm.patchValue({ durationDays: days });
  }

  // Custom validator to prevent past dates
  private noPastDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    // Parse the date string (YYYY-MM-DD) as a local date
    const dateString = control.value;
    const [year, month, day] = dateString.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day); // month is 0-indexed

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return { pastDate: true };
    }

    return null;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.medicationId = +id;
      this.loadMedication(+id);
    }
  }

  loadMedication(id: number): void {
    this.medicationService.getMedication(id).subscribe({
      next: (medication) => {
        const { amount, unit } = parseDosage(medication.dosage);

        // Parse dose times if available
        if (medication.doseTimes) {
          try {
            this.doseTimes = JSON.parse(medication.doseTimes);
          } catch {
            this.doseTimes = ['09:00']; // Default if parsing fails
          }
        }

        // Calculate duration days if end date exists
        let durationDays = '';
        if (medication.endDate) {
          const startDate = new Date(medication.startDate);
          const endDate = new Date(medication.endDate);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);
          const diffTime = endDate.getTime() - startDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Add 1 to include start date
          durationDays = diffDays.toString();
        }

        this.medicationForm.patchValue({
          name: medication.name,
          dosageAmount: amount,
          dosageUnit: unit,
          frequency: medication.frequency,
          startDate: formatDateForInput(new Date(medication.startDate)),
          durationDays: durationDays,
          notes: medication.notes || ''
        });
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load medication';
      }
    });
  }

  onSubmit(): void {
    if (this.medicationForm.valid) {
      const formValue = this.medicationForm.value;

      // Combine dosageAmount + dosageUnit into single dosage string
      const dosage = combineDosage(formValue.dosageAmount, formValue.dosageUnit);

      // Filter out empty dose times and convert to JSON
      const validDoseTimes = this.doseTimes.filter(time => time && time.trim() !== '');
      const doseTimesJson = validDoseTimes.length > 0 ? JSON.stringify(validDoseTimes) : null;

      // Calculate end date from start date + duration days (only date, no time)
      let endDate = null;
      if (formValue.durationDays && formValue.durationDays !== '') {
        const durationDays = parseInt(formValue.durationDays, 10);
        const [year, month, day] = formValue.startDate.split('-').map(Number);
        const startDateObj = new Date(year, month - 1, day); // Create local date at midnight
        startDateObj.setDate(startDateObj.getDate() + durationDays - 1); // Add duration days minus 1 (start date counts as day 1)
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

      if (this.isEditMode && this.medicationId) {
        this.medicationService.updateMedication(this.medicationId, medicationPayload).subscribe({
          next: () => this.router.navigate(['/medications']),
          error: (err) => this.errorMessage = err.error?.message || 'Failed to update medication'
        });
      } else {
        this.medicationService.createMedication(medicationPayload).subscribe({
          next: () => this.router.navigate(['/medications']),
          error: (err) => this.errorMessage = err.error?.message || 'Failed to create medication'
        });
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/medications']);
  }

  addDoseTime(): void {
    this.doseTimes.push('09:00'); // Add a new time slot with default value
  }

  removeDoseTime(index: number): void {
    if (this.doseTimes.length > 1) {
      this.doseTimes.splice(index, 1);
    }
  }

  updateDoseTime(index: number, value: string): void {
    this.doseTimes[index] = value;
  }
}
