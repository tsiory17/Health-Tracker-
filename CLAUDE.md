# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Health & Medication Tracker** - A full-stack application that helps users track medications, daily doses, and health vitals to improve medication adherence and provide simple health monitoring.

## Technology Stack

- **Backend**: ASP.NET Core Web API (C#)
- **Frontend**: Angular
- **Database**: Microsoft SQL Server
- **AI Integration**: GPT/Claude API (for prescription PDF extraction)
- **Authentication**: JWT Auth
- **Charts**: Chart.js for vitals history visualization

## Development Commands

### Backend (ASP.NET Core)
```bash
# Navigate to backend directory
cd HealthTracker.API

# Restore dependencies
dotnet restore

# Build the project
dotnet build

# Run the API
dotnet run

# Run tests
dotnet test

# Create new migration (DbContext is in Infrastructure project)
dotnet ef migrations add <MigrationName> --project ../HealthTracker.Infrastructure

# Apply migrations to database
dotnet ef database update --project ../HealthTracker.Infrastructure
```

### Frontend (Angular)
```bash
# Navigate to frontend directory
cd health-tracker-ui

# Install dependencies
npm install

# Run development server
ng serve

# Build for production
ng build --prod

# Run tests
ng test

# Run e2e tests
ng e2e

# Generate component
ng generate component <component-name>

# Generate service
ng generate service <service-name>
```

## Architecture

### Clean Architecture Structure

**Backend Layers:**
1. **API Layer** (Controllers)
   - AuthController
   - MedicationsController
   - VitalsController
   - PrescriptionController (AI extraction)

2. **Service Layer**
   - AuthService (user registration, login, JWT token generation)
   - MedicationService (CRUD operations, dose scheduling)
   - VitalsService (track and retrieve vitals)
   - PrescriptionService (AI-powered PDF extraction)

3. **Repository/Data Access Layer** (Entity Framework Core)
   - UserRepository
   - MedicationRepository
   - MedicationDoseRepository
   - VitalsRepository

### Database Schema

**Tables:**
- **Users**: UserId, Username, Email, PasswordHash, CreatedAt
- **Medications**: MedicationId, UserId, Name, Dosage, Frequency, StartDate, EndDate, Notes
- **MedicationDoses**: DoseId, MedicationId, ScheduledTime, TakenAt, IsTaken
- **Vitals**: VitalId, UserId, RecordedAt, BloodPressureSystolic, BloodPressureDiastolic, HeartRate, Weight

### Frontend Structure (Angular Modules)

- **Auth Module**
  - Login component
  - Register component

- **Dashboard Module**
  - Dashboard overview
  - Today's medication schedule

- **Medications Module**
  - Medication list
  - Add/Edit medication forms
  - Dose tracking

- **Vitals Module**
  - Vitals log/entry form
  - Vitals history chart (Chart.js)

- **Prescription Module** (Optional)
  - PDF upload component
  - AI extraction preview/edit

## Key Features

1. **User Authentication**: Register/login with JWT tokens
2. **Medication Management**: Add, edit, delete medications with dosage schedules
3. **Dose Tracking**: Daily schedule with "mark as taken" functionality
4. **Vitals Tracking**: Record blood pressure, heart rate, weight
5. **Vitals History**: View historical data with Chart.js visualizations
6. **AI Prescription Extraction** (Optional): Upload prescription PDF → AI extracts medication data

## Application Flow

1. User registers/logs in → receives JWT token
2. User adds medications with dosage schedules
3. Dashboard displays today's medication schedule
4. User marks doses as taken throughout the day
5. User logs vitals (BP, heart rate, weight)
6. User views vitals history with charts
7. (Optional) User uploads prescription PDF → AI pre-fills medication fields

## Development Guidelines

- Follow Clean Architecture principles with clear separation of concerns
- Use dependency injection for services and repositories
- Implement proper error handling and validation in both backend and frontend
- Use JWT for secure authentication
- Follow RESTful API conventions
- Use Angular reactive forms for form validation
- Implement proper TypeScript typing in Angular components
- Use Entity Framework Core migrations for database schema changes

## API Endpoints Structure

- `/api/auth/register` - User registration
- `/api/auth/login` - User login
- `/api/medications` - CRUD operations for medications
- `/api/medications/{id}/doses` - Dose schedule management
- `/api/vitals` - CRUD operations for vitals
- `/api/prescription/extract` - AI-powered PDF extraction

## Future Enhancements

- Push notifications for medication reminders
- Medication interaction warnings
- Mobile version (Xamarin or React Native)
- Doctor appointment scheduling
- Report generation and export
