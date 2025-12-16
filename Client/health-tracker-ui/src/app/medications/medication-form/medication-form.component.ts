import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MedicationService } from '../../shared/services/medication.service';
import { DOSAGE_UNITS, FREQUENCIES } from '../models/medication-form.constants';
import { parseDosage, combineDosage } from '../models/medication.utils';
import { formatDateForInput } from '../../shared/utils/date.utils';

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

  readonly dosageUnits = DOSAGE_UNITS;
  readonly frequencies = FREQUENCIES;

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
      startDate: [formatDateForInput(new Date()), [Validators.required]],
      endDate: [''],
      notes: ['', [Validators.maxLength(500)]]
    });
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

        this.medicationForm.patchValue({
          name: medication.name,
          dosageAmount: amount,
          dosageUnit: unit,
          frequency: medication.frequency,
          startDate: formatDateForInput(new Date(medication.startDate)),
          endDate: medication.endDate ? formatDateForInput(new Date(medication.endDate)) : '',
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

      const medicationPayload = {
        name: formValue.name,
        dosage: dosage,
        frequency: formValue.frequency,
        startDate: new Date(formValue.startDate).toISOString(),
        endDate: formValue.endDate ? new Date(formValue.endDate).toISOString() : null,
        notes: formValue.notes || null
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
}
