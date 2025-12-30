import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { VerifyEmailComponent } from './auth/verify-email/verify-email.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { SetupComponent } from './setup/setup.component';
import { HomeComponent } from './home/home.component';
import { MedicationsComponent } from './medications/medications.component';
import { MedicationFormComponent } from './medications/medication-form/medication-form.component';
import { TodayComponent } from './medications/today/today.component';
import { VitalsFormComponent } from './vitals/vitals-form/vitals-form.component';
import { UserMetricsComponent } from './user-metrics/user-metrics.component';
import { ProfileComponent } from './profile/profile.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'setup', component: SetupComponent },
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'bmi', component: UserMetricsComponent },
  // Backward compatibility - redirect old dashboard route to home
  { path: 'dashboard', redirectTo: '/home', pathMatch: 'full' },
  // Medication routes
  { path: 'medications', component: MedicationsComponent },
  { path: 'medications/new', component: MedicationFormComponent },
  { path: 'medications/edit/:id', component: MedicationFormComponent },
  { path: 'today', component: TodayComponent },
  // Vitals routes
  { path: 'vitals/add', component: VitalsFormComponent },
  // Placeholder routes for future implementation
  { path: 'doses', redirectTo: '/home', pathMatch: 'full' },
  { path: 'vitals', redirectTo: '/home', pathMatch: 'full' },
  { path: 'vitals-history', redirectTo: '/home', pathMatch: 'full' },
  { path: 'prescription', redirectTo: '/home', pathMatch: 'full' }
];
