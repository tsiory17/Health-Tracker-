import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Medication } from '../../shared/models/medication.model';
import { format } from 'date-fns';

@Component({
  selector: 'app-medication-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medication-detail-modal.component.html',
  styleUrl: './medication-detail-modal.component.css',
  encapsulation: ViewEncapsulation.None
})
export class MedicationDetailModalComponent {
  @Input() medication: Medication | null = null;
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  close(): void {
    this.closeModal.emit();
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM dd, yyyy');
  }

  // Close modal when clicking outside the content area
  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close();
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
}
