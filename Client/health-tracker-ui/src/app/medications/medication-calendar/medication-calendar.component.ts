import { Component, OnInit, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { addDays, isAfter, isBefore, format, startOfMonth, endOfMonth, startOfDay } from 'date-fns';
import { MedicationService } from '../../shared/services/medication.service';
import { MedicationLogService } from '../../shared/services/medication-log.service';
import { ModalService } from '../../shared/services/modal.service';
import { Medication } from '../../shared/models/medication.model';
import { DosesSummary } from '../../shared/models/medication-log.model';
import { DoseStatus } from '../../shared/models/dose-status.enum';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-medication-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, RouterLink],
  templateUrl: './medication-calendar.component.html',
  styleUrl: './medication-calendar.component.css'
})
export class MedicationCalendarComponent implements OnInit {
  @Input() compact: boolean = false; // Compact mode for dashboard

  // Dose status tracking
  doseStatusMap: Map<string, DosesSummary> = new Map();

  // User's "today" from backend (based on their timezone)
  userToday: Date | null = null;

  // Summary statistics
  summary: DosesSummary = {
    totalScheduled: 0,
    taken: 0,
    skipped: 0,
    missed: 0,
    pending: 0
  };

  calendarOptions = signal<CalendarOptions>({
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    events: [],
    eventClick: this.handleEventClick.bind(this),
    eventClassNames: this.getEventClassNames.bind(this),
    dayCellClassNames: this.getDayCellClassNames.bind(this),
    height: 'auto',
    eventDisplay: 'block',
    eventColor: '#10b981', // Emerald-500 (default)
    eventTextColor: '#ffffff',
    firstDay: 0, // Sunday
    datesSet: this.handleDatesSet.bind(this), // Load dose statuses when date range changes
    now: new Date() // Will be updated with backend's today
  });

  constructor(
    private medicationService: MedicationService,
    private medicationLogService: MedicationLogService,
    private modalService: ModalService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // First, get user's "today" from backend based on their timezone
    this.medicationLogService.getUserToday().subscribe({
      next: (response) => {
        // Parse date string as local date (not UTC) by adding time component
        // "2025-12-30" -> "2025-12-30T00:00:00" (local midnight)
        this.userToday = new Date(response.date + 'T00:00:00');

        // Update calendar's "now" to use backend's today
        // Force a complete re-render by creating a new options object
        const currentOptions = this.calendarOptions();
        this.calendarOptions.set({
          ...currentOptions,
          now: this.userToday
        });

        this.loadMedications();
      },
      error: () => {
        this.userToday = new Date(); // Fallback to browser time
        this.loadMedications();
      }
    });
  }

  handleDatesSet(dateInfo: any): void {
    // Load dose statuses for the visible month
    const start = startOfMonth(dateInfo.start);
    const end = endOfMonth(dateInfo.end);
    this.loadDoseStatuses(start, end);
  }

  loadDoseStatuses(startDate: Date, endDate: Date): void {
    // Load summaries for each day in the range
    let currentDate = new Date(startDate);

    while (isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');

      this.medicationLogService.getDosesSummary(currentDate).subscribe({
        next: (summary) => {
          this.doseStatusMap.set(dateKey, summary);
          // Force calendar to re-render with new status
          this.refreshCalendar();
        },
        error: () => {}
      });

      currentDate = addDays(currentDate, 1);
    }
  }

  refreshCalendar(): void {
    // Trigger a re-render by updating the options
    this.calendarOptions.update(options => ({ ...options }));
  }

  getDayCellClassNames(arg: any): string[] {
    const classes: string[] = [];

    if (this.userToday) {
      // Compare the date of this cell with userToday
      const cellDate = startOfDay(arg.date);
      const userTodayDate = startOfDay(this.userToday);

      // If this cell is the user's "today", add custom class
      if (cellDate.getTime() === userTodayDate.getTime()) {
        classes.push('user-today');
      }
    }

    // Remove default today highlighting if this is browser's today
    const browserToday = startOfDay(new Date());
    const cellDate = startOfDay(arg.date);
    if (cellDate.getTime() === browserToday.getTime() && this.userToday) {
      classes.push('hide-default-today');
    }

    return classes;
  }

  getEventClassNames(arg: any): string[] {
    // Get the dose status from the event's extended properties
    const status = arg.event.extendedProps?.status;

    if (status === undefined || status === null) {
      return ['event-scheduled']; // Green - default for scheduled
    }

    // Color based on individual dose status
    switch (status) {
      case DoseStatus.Pending:
        return ['event-scheduled']; // Green - not yet taken
      case DoseStatus.Taken:
        return ['event-taken']; // Gray - taken
      case DoseStatus.Skipped:
        return ['event-taken']; // Gray - treat skipped as taken
      case DoseStatus.Missed:
        return ['event-missed']; // Red - missed
      default:
        return ['event-scheduled']; // Green - default
    }
  }

  loadMedications(): void {
    // Load doses instead of medications to show individual dose events
    this.loadDoses();

    // Subscribe to dose status changes to update calendar in real-time
    this.medicationLogService.doseStatusChanged$.subscribe(() => {
      this.loadDoses();
    });
  }

  loadDoses(): void {
    // Reset summary
    this.summary = {
      totalScheduled: 0,
      taken: 0,
      skipped: 0,
      missed: 0,
      pending: 0
    };

    // Load today's doses for statistics
    const today = this.userToday || new Date();
    this.medicationLogService.getTodaysDoses(today).subscribe({
      next: (todayDoses) => {
        // Update summary with today's doses
        todayDoses.forEach(dose => {
          this.updateSummary(dose);
        });
      },
      error: () => {}
    });

    // Load all doses for calendar display
    this.medicationService.getMedications().subscribe({
      next: (medications) => {
        const events: any[] = [];

        // For each medication, fetch its doses
        medications.forEach(medication => {
          this.medicationService.getDoses(medication.medicationId).subscribe({
            next: (doses) => {
              doses.forEach((dose: any) => {
                const doseTime = new Date(dose.scheduledTime);

                events.push({
                  id: `dose-${dose.doseId}`,
                  title: `${medication.name} - ${medication.dosage}`,
                  start: format(doseTime, 'yyyy-MM-dd'),
                  allDay: true, // Hide time, only show name and dosage
                  extendedProps: {
                    doseId: dose.doseId,
                    medicationId: medication.medicationId,
                    status: dose.status,
                    dose: dose,
                    scheduledTime: doseTime
                  }
                });
              });

              // Update calendar with all events collected so far
              this.calendarOptions.update(options => ({
                ...options,
                events: [...events]
              }));
            },
            error: () => {}
          });
        });
      },
      error: () => {}
    });
  }

  private updateSummary(dose: any): void {
    this.summary.totalScheduled++;

    switch (dose.status) {
      case DoseStatus.Pending:
        this.summary.pending++;
        break;
      case DoseStatus.Taken:
        this.summary.taken++;
        break;
      case DoseStatus.Skipped:
        this.summary.skipped++;
        break;
      case DoseStatus.Missed:
        this.summary.missed++;
        break;
    }
  }

  getNextOccurrence(currentDate: Date, frequency: string): Date {
    // For MVP, all medications show as daily events
    // In future, can add time-specific events based on frequency
    switch (frequency) {
      case 'Once daily':
      case 'Twice daily':
      case 'Three times daily':
        return addDays(currentDate, 1);

      case 'Every 8 hours':
      case 'Every 12 hours':
        return addDays(currentDate, 1);

      case 'As needed':
        return addDays(currentDate, 1);

      default:
        return addDays(currentDate, 1);
    }
  }

  handleEventClick(clickInfo: EventClickArg): void {
    const medicationId = clickInfo.event.extendedProps['medicationId'] as number;

    if (medicationId) {
      // Fetch full medication details and open modal
      this.medicationService.getMedication(medicationId).subscribe({
        next: (medication) => {
          this.modalService.openMedicationDetail(medication);
        },
        error: () => {
          this.toastr.error('Failed to load medication details');
        }
      });
    }
  }
}
