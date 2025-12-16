import { Component, OnInit, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { addDays, isAfter, isBefore, format } from 'date-fns';
import { MedicationService } from '../../shared/services/medication.service';
import { Medication } from '../../shared/models/medication.model';

@Component({
  selector: 'app-medication-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, RouterLink],
  templateUrl: './medication-calendar.component.html',
  styleUrl: './medication-calendar.component.css'
})
export class MedicationCalendarComponent implements OnInit {
  @Input() compact: boolean = false; // Compact mode for dashboard

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
    height: 'auto',
    eventDisplay: 'block',
    eventColor: '#10b981', // Emerald-500
    eventTextColor: '#ffffff',
    firstDay: 0 // Sunday
  });

  constructor(private medicationService: MedicationService) {}

  ngOnInit(): void {
    this.loadMedications();
  }

  loadMedications(): void {
    this.medicationService.getMedications().subscribe({
      next: (medications) => {
        const events = this.generateCalendarEvents(medications);
        this.calendarOptions.update(options => ({
          ...options,
          events: events
        }));
      },
      error: (err) => console.error('Failed to load medications', err)
    });
  }

  generateCalendarEvents(medications: Medication[]) {
    const events: any[] = [];
    const today = new Date();
    const maxDate = addDays(today, 90); // Limit to 90 days for performance

    medications.forEach(medication => {
      const startDate = new Date(medication.startDate);
      const endDate = medication.endDate ? new Date(medication.endDate) : maxDate;

      let currentDate = startDate;
      while (isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) {
        if (!isBefore(currentDate, today)) {
          events.push({
            id: `${medication.medicationId}-${format(currentDate, 'yyyy-MM-dd')}`,
            title: `${medication.name} (${medication.dosage})`,
            start: format(currentDate, 'yyyy-MM-dd'),
            allDay: true,
            extendedProps: {
              medicationId: medication.medicationId,
              medication: medication
            }
          });
        }
        currentDate = this.getNextOccurrence(currentDate, medication.frequency);

        // Safety check to prevent infinite loops
        if (isAfter(currentDate, maxDate)) break;
      }
    });

    return events;
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
    const medicationId = clickInfo.event.extendedProps['medicationId'];
    const medication = clickInfo.event.extendedProps['medication'] as Medication;

    // Show medication details (can be enhanced with a modal)
    console.log('Clicked medication:', medication);
    // TODO: Implement detail modal or navigation to edit
  }
}
