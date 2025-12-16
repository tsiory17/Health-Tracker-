import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MedicationService } from '../../shared/services/medication.service';
import { Medication } from '../../shared/models/medication.model';

@Component({
  selector: 'app-medication-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './medication-list.component.html',
  styleUrl: './medication-list.component.css'
})
export class MedicationListComponent implements OnInit {
  medications: Medication[] = [];
  loading = true;
  errorMessage = '';

  constructor(private medicationService: MedicationService) {}

  ngOnInit(): void {
    this.loadMedications();
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

  deleteMedication(medication: Medication): void {
    if (confirm(`Are you sure you want to delete "${medication.name}"?`)) {
      this.medicationService.deleteMedication(medication.medicationId).subscribe({
        next: () => {
          this.medications = this.medications.filter(m => m.medicationId !== medication.medicationId);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to delete medication';
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
}
