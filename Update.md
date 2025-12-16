- implement the medication component , the medication after adding should show in a calendar depending on the start date and frequency, also for the add make it a dropdown list for the dosage so that the user do not need to tap , so unnit should be dropdown list (mg,ml) depending on how medicine should be do not add extra

---

# Medication Component Implementation Plan

## Overview
Implement medication management with full month calendar view and improved form (split dosage fields, frequency dropdown).

## Requirements
- **Calendar View**: Full month grid using FullCalendar showing medications on scheduled days
- **Dosage Form**: Split into Amount (number) + Unit (dropdown: mg, ml, tablets, capsules, drops)
- **Frequency**: Predefined dropdown (Once daily, Twice daily, Three times daily, Every 8/12 hours, As needed)
- **Backend**: Keep dosage as single string - combine on frontend (backwards compatible, zero migration)

## Implementation Steps

### Phase 1: Dependencies & Setup

**Install FullCalendar and date-fns:**
```bash
npm install @fullcalendar/core@6.1.15 @fullcalendar/angular@6.1.15 @fullcalendar/daygrid@6.1.15 @fullcalendar/interaction@6.1.15 date-fns@3.0.0
```

### Phase 2: Medication Form Component

**Generate component:**
```bash
ng generate component medications/medication-form --standalone
```

**FormGroup Structure (medication-form.component.ts):**
```typescript
this.medicationForm = this.fb.group({
  name: ['', [Validators.required, Validators.maxLength(200)]],
  dosageAmount: ['', [Validators.required, Validators.min(0.01)]],
  dosageUnit: ['mg', [Validators.required]],
  frequency: ['Once daily', [Validators.required]],
  startDate: [this.formatDateForInput(new Date()), [Validators.required]],
  endDate: [''],
  notes: ['', [Validators.maxLength(500)]]
});
```

**Dropdown Constants:**
```typescript
readonly DOSAGE_UNITS = [
  { value: 'mg', label: 'mg (milligrams)' },
  { value: 'ml', label: 'ml (milliliters)' },
  { value: 'tablets', label: 'Tablets' },
  { value: 'capsules', label: 'Capsules' },
  { value: 'drops', label: 'Drops' }
];

readonly FREQUENCIES = [
  { value: 'Once daily', label: 'Once daily' },
  { value: 'Twice daily', label: 'Twice daily' },
  { value: 'Three times daily', label: 'Three times daily' },
  { value: 'Every 8 hours', label: 'Every 8 hours' },
  { value: 'Every 12 hours', label: 'Every 12 hours' },
  { value: 'As needed', label: 'As needed (PRN)' }
];
```

**Key Methods:**
- `onSubmit()`: Combine `dosageAmount + dosageUnit` into single string before API call
- `parseDosage(dosageStr: string)`: Parse "500mg" into { amount: 500, unit: 'mg' } for edit mode
- `formatDateForInput()`: Format Date to 'yyyy-MM-dd' for HTML date input

**Template (medication-form.component.html):**
Follow setup.component.html pattern:
- Tailwind styling with emerald colors
- Icon + input field structure
- Validation messages with @if control flow
- Select dropdowns for unit and frequency
- Disabled submit button when form invalid

### Phase 3: Medication Calendar Component

**Generate component:**
```bash
ng generate component medications/medication-calendar --standalone
```

**FullCalendar Configuration (medication-calendar.component.ts):**
```typescript
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { addDays, isAfter, isBefore, format } from 'date-fns';

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
  eventColor: '#10b981', // Emerald-500
  eventTextColor: '#ffffff'
});
```

**Event Generation Logic:**
```typescript
generateCalendarEvents(medications: Medication[]) {
  const events: any[] = [];
  const today = new Date();
  const maxDate = addDays(today, 90); // Limit to 90 days

  medications.forEach(medication => {
    const startDate = new Date(medication.startDate);
    const endDate = medication.endDate ? new Date(medication.endDate) : maxDate;

    let currentDate = startDate;
    while (isBefore(currentDate, endDate)) {
      if (!isBefore(currentDate, today)) {
        events.push({
          title: `${medication.name} (${medication.dosage})`,
          start: format(currentDate, 'yyyy-MM-dd'),
          allDay: true,
          extendedProps: { medicationId: medication.medicationId }
        });
      }
      currentDate = addDays(currentDate, 1); // Daily for MVP
    }
  });

  return events;
}
```

**Calendar Styling (medication-calendar.component.css):**
```css
::ng-deep .fc-button {
  background-color: #10b981 !important;
  border-color: #10b981 !important;
}

::ng-deep .fc-day-today {
  background-color: #f0fdf4 !important;
}
```

### Phase 4: Medication List Component

**Generate component:**
```bash
ng generate component medications/medication-list --standalone
```

**Features:**
- Fetch and display medications in card grid
- Show name, dosage, frequency, dates
- Edit/delete buttons
- Confirm before delete
- Tailwind card styling

### Phase 5: Container Component & Routing

**Generate container:**
```bash
ng generate component medications --standalone
```

**Update app.routes.ts:**
```typescript
{ path: 'medications', component: MedicationsComponent, children: [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: MedicationListComponent },
  { path: 'calendar', component: MedicationCalendarComponent }
]},
{ path: 'medications/new', component: MedicationFormComponent },
{ path: 'medications/edit/:id', component: MedicationFormComponent }
```

**Container Template:**
Tab navigation between List and Calendar views

## Files to Create

### New Components (13 files)
1. `medications/medications.component.ts/html/css` - Container with tabs
2. `medications/medication-form/medication-form.component.ts/html/css` - Add/edit form
3. `medications/medication-list/medication-list.component.ts/html/css` - List view
4. `medications/medication-calendar/medication-calendar.component.ts/html/css` - Calendar view
5. `medications/models/medication-form.model.ts` - Form interfaces

### Files to Modify (2 files)
1. `app.routes.ts` - Add medication routes
2. `package.json` - Updated by npm install

## Key Technical Decisions

**Backwards Compatibility:**
- Keep backend dosage as single string field
- Frontend combines dosageAmount + dosageUnit before API call
- Parse existing dosage strings for edit mode
- Zero database migration needed

**Calendar Events:**
- Generate events on frontend (don't create MedicationDose records)
- Limit to 90 days of future events for performance
- Show daily events for all frequencies (MVP)
- Use date-fns for all date calculations

**Form Pattern:**
- Reactive Forms with FormBuilder
- Tailwind styling matching setup.component.html
- Standalone Angular 17 components
- Validation messages with @if control flow

## Critical Files for Reference

**For Form Patterns:**
- `setup/setup.component.html` - Form styling pattern
- `setup/setup.component.ts` - Reactive form with custom validator
- `auth/login/login.component.html` - Input field styling

**For Service Integration:**
- `shared/services/medication.service.ts` - API methods already exist

## Testing Checklist

- [ ] Create new medication with split dosage fields
- [ ] Edit existing medication (parse old dosage format)
- [ ] Delete medication with confirmation
- [ ] View medications in list view
- [ ] View medications in calendar view
- [ ] Click calendar event shows details
- [ ] Form validation works correctly
- [ ] Calendar shows medications on correct dates
- [ ] Backwards compatible with existing medications

## Future Enhancements (Not in MVP)

- Time-specific doses (multiple events per day)
- Mark doses as taken from calendar
- Color coding by medication type
- Dose tracking integration with MedicationDose table
- Week/day calendar views

- Adds on

The medicine is clickable so that when it s taken the user can cross it 
There should be a navbar for notifications, for example notification to say that you need to go to the pharmacy to get new supply or something like this , 

Ai should be implemented in the note to write down what to avoid while taking the medicine if any also write down if be careful with driving it cause drowzyness something like that , also a + button should be added to import file for prescription to get the medicine directly 

