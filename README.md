# Health Tracker

> **Never forget to take your medication again** - Your personal medication tracking companion with smart reminders and comprehensive health monitoring.

A full-stack web application that helps users track medications, manage daily doses with real-time reminders, and monitor health vitals. Built with ASP.NET Core and Angular.

**Live demo**: [Health Tracker](https://www.heathtracker17.online)

![.NET](https://img.shields.io/badge/.NET-9.0-purple.svg)
![Angular](https://img.shields.io/badge/Angular-17-red.svg)

## Features

### Authentication & Security
- **Email Verification**: Secure account creation with email confirmation
- **JWT Authentication**: Token-based secure authentication
- **Password Recovery**: Forgot password and reset functionality
- **Profile Management**: User profile with timezone settings

### Medication Management
- **Medication CRUD**: Add, edit, delete, and view medications
- **Dose Scheduling**: Automatic dose scheduling based on frequency
- **Medication Calendar**: Interactive calendar view powered by FullCalendar
- **Today's Doses**: Daily medication schedule with easy tracking
- **Real-time Reminders**: SignalR-powered real-time notifications for upcoming doses
- **Missed Dose Alerts**: Background service tracks and notifies about missed medications
- **Detailed Medication View**: Modal with comprehensive medication information

### Health Monitoring
- **Vitals Tracking**: Record blood pressure, heart rate, and weight
- **BMI Calculator**: Automatic BMI calculation and tracking
- **Health Metrics**: User metrics with initial setup wizard
- **Data Visualization**: Chart.js powered charts for health trends

### User Experience
- **Welcome Flow**: Onboarding explanation page for new users
- **Initial Setup**: Guided setup for user health metrics (DOB, height, weight)
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Toast Notifications**: Real-time feedback with ngx-toastr
- **Dark Mode Ready**: Beautiful gradient backgrounds and modern UI

### AI Integration (Optional)
- **Prescription Extraction**: AI-powered medication data extraction from prescription PDFs
- **Smart Data Entry**: Pre-fill medication forms from uploaded prescriptions

## Technology Stack

### Backend
- **Framework**: ASP.NET Core 9.0 Web API (C#)
- **ORM**: Entity Framework Core
- **Database**: PostgreSQL (with SQL Server support)
- **Authentication**: JWT Bearer tokens
- **Real-time**: SignalR for live notifications
- **Background Jobs**: Hosted background services for reminders
- **Email**: SMTP email service for verification and notifications

### Frontend
- **Framework**: Angular 17 (Standalone Components)
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Custom components with modern design
- **Charts**: Chart.js for data visualization
- **Calendar**: FullCalendar for medication scheduling
- **Date Handling**: date-fns for date manipulation
- **Notifications**: ngx-toastr for toast notifications
- **Real-time**: SignalR client for live updates
- **HTTP**: RxJS for reactive programming

### Development Tools
- **Language**: TypeScript 5.4
- **Build Tool**: Angular CLI
- **CSS Preprocessor**: PostCSS with Autoprefixer
- **Testing**: Jasmine & Karma

## Project Structure

```
Health-Tracker-/
├── Server/
│   └── HealthTracker.API/
│       ├── Controllers/
│       │   ├── AuthController.cs
│       │   ├── MedicationsController.cs
│       │   ├── MedicationLogController.cs
│       │   ├── VitalsController.cs
│       │   ├── UserMetricsController.cs
│       │   └── HealthController.cs
│       ├── Jobs/
│       │   ├── MissedDoseNotificationBackgroundService.cs
│       │   └── UpcomingReminderBackgroundService.cs
│       ├── Hubs/
│       │   └── NotificationHub.cs (SignalR)
│       ├── Models/
│       ├── Repositories/
│       └── Services/
│
└── Client/
    └── health-tracker-ui/
        └── src/app/
            ├── auth/
            │   ├── login/
            │   ├── register/
            │   ├── verify-email/
            │   ├── forgot-password/
            │   └── reset-password/
            ├── explanation/         # Onboarding welcome
            ├── setup/               # Initial user setup
            ├── home/                # Main dashboard
            ├── medications/
            │   ├── medications.component (list view)
            │   ├── medication-form/
            │   ├── medication-detail-modal/
            │   ├── medication-calendar/
            │   └── today/           # Today's dose schedule
            ├── vitals/
            │   └── vitals-form/
            ├── user-metrics/        # BMI & health metrics
            ├── profile/             # User profile settings
            ├── prescription/        # AI prescription upload
            └── shared/
                ├── navbar/
                ├── footer/
                ├── services/
                ├── models/
                └── timezone-update-dialog/
```

## Getting Started

### Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Angular CLI](https://angular.io/cli): `npm install -g @angular/cli`
- [PostgreSQL](https://www.postgresql.org/download/) or [SQL Server](https://www.microsoft.com/sql-server)
- SMTP Email Server (Gmail, SendGrid, etc.) for email features

### Backend Setup

1. **Navigate to the backend directory**
   ```bash
   cd Server/HealthTracker.API
   ```

2. **Configure database connection**

   Edit `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Database=HealthTrackerDb;Username=your_user;Password=your_password"
     }
   }
   ```

3. **Configure email settings**

   Add to `appsettings.json`:
   ```json
   {
     "EmailSettings": {
       "SmtpServer": "smtp.gmail.com",
       "SmtpPort": 587,
       "SenderEmail": "your-email@gmail.com",
       "SenderPassword": "your-app-password"
     }
   }
   ```

4. **Run database migrations**
   ```bash
   dotnet ef database update
   ```

5. **Run the API**
   ```bash
   dotnet run
   ```

   API will be available at `https://localhost:7000` (or configured port)

### Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd Client/health-tracker-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API URL**

   Edit `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'https://localhost:7000/api'
   };
   ```

4. **Run the development server**
   ```bash
   ng serve
   ```

   Navigate to `http://localhost:4200`

## How It Works

### User Journey

1. **Registration & Verification**
   - User registers with email, username, and password
   - Email verification link sent to user's inbox
   - User verifies email and logs in
   - JWT token generated and stored

2. **Initial Setup**
   - Welcome explanation page introduces app features
   - User completes health metrics setup (DOB, height, weight)
   - BMI automatically calculated

3. **Medication Management**
   - Add medications with name, dosage, frequency, and dates
   - System auto-generates dose schedule
   - View medications in list, calendar, or today's view
   - Receive real-time reminders via SignalR

4. **Daily Tracking**
   - View today's medication schedule
   - Mark doses as taken with one click
   - System records exact timestamp
   - Background service monitors missed doses

5. **Health Monitoring**
   - Log vitals (blood pressure, heart rate, weight)
   - Track BMI changes over time
   - View health trends with interactive charts

6. **Real-time Notifications**
   - Receive browser notifications for upcoming doses
   - Get alerts for missed medications
   - All notifications powered by SignalR

## Database Schema

### Key Tables

**Users**
- UserId, Username, Email, PasswordHash, TimeZoneId
- EmailConfirmed, EmailVerificationToken
- PasswordResetToken, ResetTokenExpiry

**UserMetrics**
- UserId, DateOfBirth, HeightCm, WeightKg
- BMI (calculated), CreatedAt, UpdatedAt

**Medications**
- MedicationId, UserId, Name, Dosage
- Frequency, StartDate, EndDate, Notes
- CreatedAt, UpdatedAt

**MedicationLogs**
- LogId, MedicationId, ScheduledTime
- TakenAt, IsTaken, Status

**Vitals**
- VitalId, UserId, RecordedAt
- BloodPressureSystolic, BloodPressureDiastolic
- HeartRate, Weight

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login and get JWT token
- `POST /verify-email` - Verify email address
- `POST /resend-verification` - Resend verification email
- `POST /forgot-password` - Request password reset
- `POST /validate-reset-token` - Validate reset token
- `POST /reset-password` - Reset password
- `PUT /update-profile` - Update user profile

### Medications (`/api/medications`)
- `GET /` - Get all user medications
- `GET /{id}` - Get specific medication
- `POST /` - Create medication
- `PUT /{id}` - Update medication
- `DELETE /{id}` - Delete medication

### Medication Logs (`/api/medication-log`)
- `GET /user/{userId}` - Get user's medication logs
- `GET /today` - Get today's doses
- `GET /medication/{medicationId}` - Get logs for medication
- `POST /take/{logId}` - Mark dose as taken
- `POST /skip/{logId}` - Skip dose

### Vitals (`/api/vitals`)
- `GET /` - Get all user vitals
- `GET /{id}` - Get specific vital record
- `POST /` - Create vital record
- `PUT /{id}` - Update vital record
- `DELETE /{id}` - Delete vital record

### User Metrics (`/api/user-metrics`)
- `GET /setup-status` - Check if user completed setup
- `POST /` - Save user metrics
- `GET /` - Get user metrics

### Health (`/api/health`)
- `GET /` - Health check endpoint

### SignalR Hub (`/notificationHub`)
- Real-time medication reminders
- Missed dose notifications
- Connection management

## Key Features Implementation

### Real-time Notifications
The application uses SignalR for real-time communication:
- Background service checks for upcoming medications every minute
- Notifications sent to connected clients via SignalR hub
- Browser notifications for missed and upcoming doses

### Email Verification Flow
- User registers → verification email sent
- Email contains unique token link
- User clicks link → account verified
- Can resend verification if needed

### Password Reset Flow
- User requests reset → reset email sent
- Email contains token and link
- User validates token → sets new password
- Token expires after set time

### Timezone Support
- User timezone detected from browser
- All times stored in UTC in database
- Converted to user's timezone for display
- Timezone mismatch dialog prompts updates


## Technologies

- [Angular](https://angular.io/)
- [ASP.NET Core](https://dotnet.microsoft.com/apps/aspnet)
- [Tailwind CSS](https://tailwindcss.com/)
- [Chart.js](https://www.chartjs.org/)
- [FullCalendar](https://fullcalendar.io/)
- [SignalR](https://dotnet.microsoft.com/apps/aspnet/signalr)

---

**Built for better health management**
