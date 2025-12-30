import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicationLogService } from '../../shared/services/medication-log.service';
import { MedicationService } from '../../shared/services/medication.service';
import { ModalService } from '../../shared/services/modal.service';
import { MedicationDoseResponse } from '../../shared/models/medication-log.model';
import { DoseStatus } from '../../shared/models/dose-status.enum';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-today',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './today.component.html',
  styleUrls: ['./today.component.css']
})
export class TodayComponent implements OnInit {
  doses: MedicationDoseResponse[] = [];
  loading: boolean = true;
  DoseStatus = DoseStatus; // Expose enum to template
  today: Date = new Date(); // Will be updated with backend's "today"

  // Skip modal state
  showSkipModal: boolean = false;
  selectedDose: MedicationDoseResponse | null = null;
  skipReason: string = '';

  constructor(
    private medicationLogService: MedicationLogService,
    private medicationService: MedicationService,
    private modalService: ModalService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // First, get user's "today" from backend based on their timezone
    this.medicationLogService.getUserToday().subscribe({
      next: (response) => {
        // Parse date string as local date (not UTC) by adding time component
        // "2025-12-30" -> "2025-12-30T00:00:00" (local midnight)
        this.today = new Date(response.date + 'T00:00:00');
        this.loadTodaysDoses();
      },
      error: () => {
        // Even if this fails, still load doses - backend will handle timezone correctly
        this.loadTodaysDoses();
      }
    });
  }

  loadTodaysDoses(): void {
    this.loading = true;
    this.medicationLogService.getTodaysDoses().subscribe({
      next: (doses) => {
        this.doses = doses;
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Failed to load today\'s medications');
        this.loading = false;
      }
    });
  }

  markAsTaken(dose: MedicationDoseResponse): void {
    this.medicationLogService.markDoseAsTaken(dose.doseId).subscribe({
      next: () => {
        this.toastr.success(`${dose.medicationName} marked as taken`);
        this.loadTodaysDoses(); // Refresh list to show updated status
      },
      error: () => {
        this.toastr.error('Failed to mark dose as taken');
      }
    });
  }

  openSkipModal(dose: MedicationDoseResponse): void {
    this.selectedDose = dose;
    this.skipReason = '';
    this.showSkipModal = true;
  }

  closeSkipModal(): void {
    this.showSkipModal = false;
    this.selectedDose = null;
    this.skipReason = '';
  }

  confirmSkip(): void {
    if (!this.selectedDose) return;
    
    this.medicationLogService.updateDoseStatus(this.selectedDose.doseId, {
      status: DoseStatus.Skipped,
      notes: this.skipReason
    }).subscribe({
      next: () => {
        this.toastr.info(`${this.selectedDose!.medicationName} skipped`);
        this.closeSkipModal();
        this.loadTodaysDoses();
      },
      error: () => {
        this.toastr.error('Failed to skip dose');
      }
    });
  }

  getStatusClass(status: DoseStatus): string {
    switch(status) {
      case DoseStatus.Taken: return 'status-taken';
      case DoseStatus.Skipped: return 'status-skipped';
      case DoseStatus.Missed: return 'status-missed';
      default: return 'status-pending';
    }
  }

  getStatusText(status: DoseStatus): string {
    switch(status) {
      case DoseStatus.Taken: return 'Taken';
      case DoseStatus.Skipped: return 'Skipped';
      case DoseStatus.Missed: return 'Missed';
      default: return 'Pending';
    }
  }

  // Detail modal method
  openDetailModal(dose: MedicationDoseResponse): void {
    this.medicationService.getMedication(dose.medicationId).subscribe({
      next: (medication) => {
        this.modalService.openMedicationDetail(medication);
      },
      error: () => {
        this.toastr.error('Failed to load medication details');
      }
    });
  }
}
