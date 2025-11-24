Create a clean project “Health & Medication Tracker”.

1. **Title**
   - Health & Medication Tracker

2. **Goal**
   - the project helps users track medications, daily doses, and health vitals. 
   - it improves medication adherence and provides simple health monitoring.

3. **Features**
   - User authentication (register/login)
   - Add/edit/delete medications
   - Daily dose schedule with "mark as taken"
   - Track vitals (blood pressure, heart rate, weight)
   - View vitals history chart
   - (Optional advanced) Upload prescription PDF → AI extracts medication data

4. **Technologies**
   - Backend: ASP.NET Core Web API (C#)
   - Frontend: Angular
   - Database: microsoft SQL Server
   - AI extraction: GPT/Claude API 
   - Other: Chart.js, JWT Auth

5. **Architecture**
   - Clean architecture overview
   - API layer (Controllers)
   - Service layer (MedicationService, VitalsService, AuthService)
   - Repository/Data Access layer (EF Core)
   - Angular modules/pages:
       - Auth pages
       - Dashboard
       - Medications
       - Add/edit medication
       - Vitals log
       - PDF upload page (optional)
   - Database tables:
       - Users
       - Medications
       - MedicationDoses
       - Vitals

6. **How It Works**
   - Brief explanation of flow: user logs in → adds meds → sees schedule → logs vitals → views history → optionally uploads prescription PDF → AI pre-fills fields.

7. **Installation & Setup**
   - Provide steps to run backend and frontend.

8. **Future Improvements**
   - Push notifications
   - Medication interaction warnings
   - Mobile version

Make the README structured, clean, and formatted in Markdown with headings and bullet points.
