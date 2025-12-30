import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { RealTimeNotificationService } from './shared/services/real-time-notification.service';
import { AuthService } from './shared/services/auth.service';
import { TimezoneService } from './shared/services/timezone.service';
import { ModalService } from './shared/services/modal.service';
import { TimezoneUpdateDialogComponent } from './shared/timezone-update-dialog/timezone-update-dialog.component';
import { MedicationDetailModalComponent } from './medications/medication-detail-modal/medication-detail-modal.component';
import { Medication } from './shared/models/medication.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, TimezoneUpdateDialogComponent, MedicationDetailModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Health Tracker';
  showSidebar = false;
  showNavbar = false;
  mobileMenuOpen = false;
  showTimezoneDialog = false;
  detectedTimezone = '';
  currentTimezone = '';

  // Medication detail modal state
  showMedicationDetailModal = false;
  selectedMedication: Medication | null = null;

  constructor(
    private router: Router,
    private realtimeService: RealTimeNotificationService,
    private authService: AuthService,
    private timezoneService: TimezoneService,
    private modalService: ModalService
  ) { }

  ngOnInit() {
    // Check initial route on app load
    this.checkRoute(this.router.url);

    // Subscribe to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkRoute(event.url);
    });

    // Initialize SignalR connection if user is logged in
    const token = this.authService.getToken();
    if (token) {
      this.realtimeService.connect(token).catch(() => {});

      // Check timezone after login
      this.checkTimezone();
    }

    // Subscribe to auth state changes to check timezone on login
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.checkTimezone();
      }
    });

    // Subscribe to medication detail modal
    this.modalService.medicationDetail$.subscribe(({ isOpen, medication }) => {
      this.showMedicationDetailModal = isOpen;
      this.selectedMedication = medication;
    });
  }

  private checkTimezone() {
    const user = this.authService.getCurrentUser();
    if (!user || !user.timeZoneId) {
      return;
    }

    this.detectedTimezone = this.timezoneService.getCurrentWindowsTimezone();
    this.currentTimezone = user.timeZoneId;

    // Show dialog if timezones are different
    if (this.timezoneService.isTimezoneDifferent(user.timeZoneId)) {
      // Delay showing dialog to avoid showing it on every page load
      // Only show once per session
      const hasShownDialog = sessionStorage.getItem('timezoneDialogShown');
      if (!hasShownDialog) {
        setTimeout(() => {
          this.showTimezoneDialog = true;
        }, 1000); // 1 second delay
        sessionStorage.setItem('timezoneDialogShown', 'true');
      }
    }
  }

  updateTimezone() {
    this.authService.updateProfile(this.detectedTimezone).subscribe({
      next: () => {
        this.showTimezoneDialog = false;
        this.authService.updateCurrentUserTimezone(this.detectedTimezone);
      },
      error: () => {
        alert('Failed to update timezone. Please try again.');
      }
    });
  }

  dismissTimezoneDialog() {
    this.showTimezoneDialog = false;
  }

  ngOnDestroy() {
    this.realtimeService.disconnect();
  }

  private checkRoute(url: string) {
    // Hide sidebar margin and navbar for login, register, setup, and verify-email pages
    const authPages = ['/login', '/register', '/setup', '/verify-email', '/'];
    const isAuthPage = authPages.some(path => {
      if (path === '/') {
        return url === '/' || url === '';
      }
      return url.includes(path);
    });

    // Also check if user is authenticated
    const isAuthenticated = !!this.authService.getToken();

    // Show sidebar only if not on auth page AND user is authenticated
    this.showSidebar = !isAuthPage && isAuthenticated;
    this.showNavbar = !isAuthPage && isAuthenticated;

    // Close mobile menu on route change
    this.mobileMenuOpen = false;
  }

  toggleMobileSidebar() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileSidebar() {
    this.mobileMenuOpen = false;
  }

  closeMedicationDetailModal() {
    this.modalService.closeMedicationDetail();
  }
}
