import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimezoneService } from '../services/timezone.service';

@Component({
  selector: 'app-timezone-update-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timezone-update-dialog.component.html',
  styleUrl: './timezone-update-dialog.component.css'
})
export class TimezoneUpdateDialogComponent {
  @Input() currentTimezone: string = '';
  @Input() detectedTimezone: string = '';
  @Output() updateTimezone = new EventEmitter<void>();
  @Output() dismiss = new EventEmitter<void>();

  constructor(public timezoneService: TimezoneService) {}

  onUpdate(): void {
    this.updateTimezone.emit();
  }

  onDismiss(): void {
    this.dismiss.emit();
  }

  getCurrentDisplayName(): string {
    return this.timezoneService.getTimezoneDisplayName(this.currentTimezone);
  }

  getDetectedDisplayName(): string {
    return this.timezoneService.getTimezoneDisplayName(this.detectedTimezone);
  }
}
