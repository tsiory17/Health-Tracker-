import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MedicationListComponent } from './medication-list/medication-list.component';
import { MedicationCalendarComponent } from './medication-calendar/medication-calendar.component';

@Component({
  selector: 'app-medications',
  standalone: true,
  imports: [CommonModule, RouterModule, MedicationListComponent, MedicationCalendarComponent],
  templateUrl: './medications.component.html',
  styleUrl: './medications.component.css'
})
export class MedicationsComponent {
  activeTab: 'list' | 'calendar' = 'list';

  setActiveTab(tab: 'list' | 'calendar'): void {
    this.activeTab = tab;
  }
}
