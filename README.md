# Health & Medication Tracker

A full-stack application designed to help users track medications, daily doses, and health vitals to improve medication adherence and provide simple health monitoring.

## Table of Contents

- [Goal](#goal)
- [Features](#features)
- [Technologies](#technologies)
- [Architecture](#architecture)
- [Installation & Setup](#installation--setup)
- [How It Works](#how-it-works)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Future Improvements](#future-improvements)

## Goal

The project helps users:
- Track medications and daily doses
- Improve medication adherence through scheduled reminders
- Monitor health vitals (blood pressure, heart rate, weight)
- View historical health data with visualizations
- (Optional) Extract medication data from prescription PDFs using AI

## Features

### Core Features
- **User Authentication**: Secure register/login system with JWT tokens
- **Medication Management**: Add, edit, and delete medications with dosage schedules
- **Daily Dose Schedule**: View and mark medications as taken throughout the day
- **Vitals Tracking**: Record blood pressure, heart rate, and weight measurements
- **Vitals History Chart**: Visualize health trends over time using Chart.js

### Optional Advanced Feature
- **Prescription PDF Upload**: Upload prescription PDFs and use AI (GPT/Claude API) to automatically extract medication information

## Technologies

### Backend
- **ASP.NET Core Web API** (C#) - RESTful API
- **Entity Framework Core** - ORM for database access
- **Microsoft SQL Server** - Database
- **JWT Authentication** - Secure token-based authentication

### Frontend
- **Angular** - Single-page application framework
- **Chart.js** - Data visualization for vitals history
- **TypeScript** - Type-safe development

### AI Integration (Optional)
- **GPT/Claude API** - Prescription text extraction

## Architecture

The project follows Clean Architecture principles with clear separation of concerns:

### Backend Structure

```
HealthTracker.API/          # Web API Layer
├── Controllers/            # API endpoints
│   ├── AuthController
│   ├── MedicationsController
│   ├── VitalsController
│   └── PrescriptionController (optional)
└── Program.cs

HealthTracker.Core/         # Domain Layer
├── Entities/              # Domain models
│   ├── User
│   ├── Medication
│   ├── MedicationDose
│   └── Vital
└── Interfaces/            # Repository interfaces

HealthTracker.Services/     # Business Logic Layer
├── AuthService            # Authentication & JWT generation
├── MedicationService      # Medication CRUD & scheduling
├── VitalsService          # Vitals tracking
└── PrescriptionService    # AI PDF extraction (optional)

HealthTracker.Infrastructure/  # Data Access Layer
├── Data/
│   └── ApplicationDbContext
└── Repositories/
    └── Repository<T>      # Generic repository pattern
```

### Frontend Structure

```
health-tracker-ui/
├── src/app/
│   ├── auth/              # Authentication module
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/         # Dashboard module
│   ├── medications/       # Medications module
│   │   ├── medication-list/
│   │   └── medication-form/
│   ├── vitals/           # Vitals module
│   │   ├── vitals-form/
│   │   └── vitals-chart/
│   ├── prescription/     # Prescription upload (optional)
│   └── shared/
│       ├── models/       # TypeScript interfaces
│       ├── services/     # HTTP services
│       ├── guards/       # Route guards
│       └── interceptors/ # HTTP interceptors
```

## Installation & Setup

### Prerequisites
- [.NET 9.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18+)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)
- [Microsoft SQL Server](https://www.microsoft.com/sql-server)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Health-Tracker-
   ```

2. **Update database connection string**

   Edit `HealthTracker.API/appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=HealthTrackerDb;Trusted_Connection=True;"
     }
   }
   ```

3. **Create and run database migrations**
   ```bash
   cd HealthTracker.API

   # Create initial migration (DbContext is in Infrastructure project)
   dotnet ef migrations add InitialCreate --project ../HealthTracker.Infrastructure

   # Apply migration to database
   dotnet ef database update --project ../HealthTracker.Infrastructure
   ```

4. **Run the API**
   ```bash
   dotnet run
   ```
   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd health-tracker-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Update API URL** (if different from default)

   Edit service files in `src/app/shared/services/` to match your API URL

4. **Run the development server**
   ```bash
   ng serve
   ```
   The application will be available at `http://localhost:4200`

## How It Works

### User Flow

1. **Registration & Login**
   - User creates an account with username, email, and password
   - System generates JWT token upon successful authentication
   - Token is stored in browser's localStorage

2. **Medication Management**
   - User adds medications with details (name, dosage, frequency, dates)
   - System automatically generates dose schedule based on frequency
   - Dashboard displays today's medication schedule

3. **Dose Tracking**
   - User views daily medication schedule
   - User marks doses as taken with a single click
   - System records the exact time medication was taken

4. **Vitals Monitoring**
   - User logs health vitals (blood pressure, heart rate, weight)
   - Data is timestamped and stored in the database
   - Charts display historical trends for each vital sign

5. **AI Prescription Extraction (Optional)**
   - User uploads prescription PDF
   - AI extracts medication details (name, dosage, frequency)
   - User reviews and edits extracted data before saving

## Database Schema

### Users Table
| Column        | Type         | Description                |
|---------------|--------------|----------------------------|
| UserId        | INT          | Primary Key                |
| Username      | NVARCHAR(100)| User's display name        |
| Email         | NVARCHAR(255)| Unique email (login)       |
| PasswordHash  | NVARCHAR(MAX)| Hashed password           |
| CreatedAt     | DATETIME     | Account creation timestamp |

### Medications Table
| Column        | Type         | Description                |
|---------------|--------------|----------------------------|
| MedicationId  | INT          | Primary Key                |
| UserId        | INT          | Foreign Key → Users        |
| Name          | NVARCHAR(200)| Medication name            |
| Dosage        | NVARCHAR(100)| Dosage amount (e.g., "500mg") |
| Frequency     | NVARCHAR(100)| Frequency (e.g., "2x daily") |
| StartDate     | DATETIME     | Treatment start date       |
| EndDate       | DATETIME     | Treatment end date (nullable) |
| Notes         | NVARCHAR(MAX)| Optional notes            |

### MedicationDoses Table
| Column        | Type         | Description                |
|---------------|--------------|----------------------------|
| DoseId        | INT          | Primary Key                |
| MedicationId  | INT          | Foreign Key → Medications  |
| ScheduledTime | DATETIME     | When dose should be taken  |
| TakenAt       | DATETIME     | When dose was actually taken (nullable) |
| IsTaken       | BIT          | Boolean flag              |

### Vitals Table
| Column                 | Type         | Description                |
|------------------------|--------------|----------------------------|
| VitalId                | INT          | Primary Key                |
| UserId                 | INT          | Foreign Key → Users        |
| RecordedAt             | DATETIME     | Measurement timestamp      |
| BloodPressureSystolic  | INT          | Systolic BP (nullable)     |
| BloodPressureDiastolic | INT          | Diastolic BP (nullable)    |
| HeartRate              | INT          | BPM (nullable)             |
| Weight                 | DECIMAL(5,2) | Weight in kg (nullable)    |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and receive JWT token

### Medications
- `GET /api/medications` - Get all medications for authenticated user
- `GET /api/medications/{id}` - Get specific medication
- `POST /api/medications` - Create new medication
- `PUT /api/medications/{id}` - Update medication
- `DELETE /api/medications/{id}` - Delete medication

### Medication Doses
- `GET /api/medications/{id}/doses` - Get dose schedule for medication
- `PATCH /api/medications/doses/{id}/take` - Mark dose as taken

### Vitals
- `GET /api/vitals` - Get all vitals for authenticated user
- `GET /api/vitals/{id}` - Get specific vital record
- `POST /api/vitals` - Create new vital record
- `PUT /api/vitals/{id}` - Update vital record
- `DELETE /api/vitals/{id}` - Delete vital record

### Prescription (Optional)
- `POST /api/prescription/extract` - Upload PDF and extract medication data

## Future Improvements

- **Push Notifications**: Send reminders when medications are due
- **Medication Interaction Warnings**: Check for drug interactions
- **Mobile Version**: Native mobile app using Xamarin or React Native
- **Doctor Appointment Scheduling**: Integrated calendar for medical appointments
- **Report Generation**: Export health data as PDF reports
- **Multiple Users**: Family account management
- **Medication Refill Reminders**: Alert when running low on medications
- **Integration with Pharmacies**: Order refills directly through the app
- **Health Goals**: Set and track health objectives (weight loss, BP targets)

## Contributing

This is a portfolio project. Feel free to fork and modify for your own use.

## License

MIT License - feel free to use this project for learning and portfolio purposes.
