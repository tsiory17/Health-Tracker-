# Email Verification Implementation Plan

## Overview
Add email verification to the Health Tracker registration system using SMTP (Gmail/Outlook) with app passwords. Users must verify their email before they can login.

## User Preferences
- **Email Provider**: SMTP (Gmail/Outlook) with app passwords
- **Login Policy**: Block login until email is verified , redirect to login when email is verified 

## Implementation Steps

### 1. Database Changes

#### Update User Model
**File**: `Server/HealthTracker.API/Models/User.cs`
- Add `IsEmailVerified` (bool, default false)
- Add `EmailVerificationToken` (nullable string)
- Add `EmailVerificationTokenExpiry` (nullable DateTime)

#### Update DbContext Configuration
**File**: `Server/HealthTracker.API/Data/ApplicationDbContext.cs`
- Update User entity configuration in `OnModelCreating` method
- Add email verification property configurations

#### Create Migration
```bash
cd Server/HealthTracker.API
dotnet ef migrations add AddEmailVerification
dotnet ef database update
```

---

### 2. Email Service Setup

#### Install NuGet Packages
```bash
cd Server/HealthTracker.API
dotnet add package MailKit
dotnet add package MimeKit
```

#### Create Email Configuration Model
**New File**: `Server/HealthTracker.API/Models/EmailSettings.cs`
- Properties: SmtpServer, SmtpPort, SenderEmail, SenderName, Username, Password, UseSsl

#### Create Email Service Interface
**New File**: `Server/HealthTracker.API/Repositories/IEmailService.cs`
```csharp
public interface IEmailService
{
    Task<bool> SendVerificationEmailAsync(string toEmail, string username, string verificationToken);
    Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody);
}
```

#### Implement Email Service
**New File**: `Server/HealthTracker.API/Services/EmailService.cs`
- Use MailKit/MimeKit for SMTP
- Inject `IConfiguration` to read email settings
- Create HTML email template with verification link format: `http://localhost:4200/verify-email?token={token}`
- Include professional email template with username greeting, verification button, and expiry notice
- Handle SMTP errors gracefully (log but don't crash registration)

#### Update Configuration
**File**: `Server/HealthTracker.API/appsettings.json`
Add sections:
```json
"EmailSettings": {
  "SmtpServer": "smtp.gmail.com",
  "SmtpPort": 587,
  "SenderEmail": "your-email@gmail.com",
  "SenderName": "Health Tracker",
  "Username": "your-email@gmail.com",
  "Password": "your-app-password-here",
  "UseSsl": true
},
"AppSettings": {
  "FrontendUrl": "http://localhost:4200",
  "EmailVerificationTokenExpiryHours": 24
}
```

**Gmail Setup Note**: Must enable 2FA and create App Password at https://myaccount.google.com/apppasswords

#### Register Service in DI Container
**File**: `Server/HealthTracker.API/Program.cs`
After line 64, add:
```csharp
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
```

---

### 3. AuthService Updates

#### Update Interface
**File**: `Server/HealthTracker.API/Repositories/IAuthService.cs`
Add methods:
```csharp
Task<(bool Success, string Message)> VerifyEmailAsync(string token);
Task<(bool Success, string Message)> ResendVerificationEmailAsync(string email);
```

#### Update AuthService Implementation
**File**: `Server/HealthTracker.API/Services/AuthService.cs`

**Changes needed:**

1. **Update Constructor**: Inject `IEmailService`

2. **Update RegisterAsync**:
   - Generate cryptographically secure verification token (Base64 random bytes)
   - Hash token before storing (SHA256 for security)
   - Set `IsEmailVerified = false` and store hashed token with 24hr expiry
   - Send verification email (don't fail registration if email fails)
   - Return success WITHOUT JWT token

3. **Update LoginAsync**:
   - Add check: if `!user.IsEmailVerified`, return `(false, "EMAIL_NOT_VERIFIED", null)`
   - Only issue JWT token if email is verified

4. **Add Helper Methods**:
   - `GenerateVerificationToken()`: Create secure random token
   - `HashVerificationToken(string token)`: SHA256 hash for storage

5. **Implement VerifyEmailAsync**:
   - Hash provided token and find matching user
   - Check token expiry (reject if expired)
   - Check if already verified
   - Update user: set `IsEmailVerified = true`, clear token fields
   - Return success message

6. **Implement ResendVerificationEmailAsync**:
   - Find user by email
   - Check if already verified (reject if true)
   - Generate new token and update user
   - Send new verification email
   - Return success message

---

### 4. Controller Updates

#### Update AuthController
**File**: `Server/HealthTracker.API/Controllers/AuthController.cs`

**Changes:**

1. **Update Register endpoint** (line 18-38):
   - Change response to NOT return token
   - Return: `{ message: "Registration successful. Please check your email...", email }`

2. **Update Login endpoint** (line 40-60):
   - Handle `EMAIL_NOT_VERIFIED` error case
   - Return 401 with `{ message: "...", requiresVerification: true }`

3. **Add VerifyEmail endpoint**:
```csharp
[HttpPost("verify-email")]
public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
{
    var (success, message) = await _authService.VerifyEmailAsync(request.Token);
    return success ? Ok(new { message }) : BadRequest(new { message });
}
```

4. **Add ResendVerification endpoint**:
```csharp
[HttpPost("resend-verification")]
public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationRequest request)
{
    var (success, message) = await _authService.ResendVerificationEmailAsync(request.Email);
    return success ? Ok(new { message }) : BadRequest(new { message });
}
```

5. **Add Request DTOs** (after line 64):
```csharp
public record VerifyEmailRequest(string Token);
public record ResendVerificationRequest(string Email);
```

---

### 5. Frontend Updates (Angular)

#### Update AuthService
**File**: `Client/health-tracker-ui/src/app/shared/services/auth.service.ts`

Add methods:
```typescript
verifyEmail(token: string): Observable<{ message: string }> {
  return this.http.post<{ message: string }>(`${this.apiUrl}/verify-email`, { token });
}

resendVerification(email: string): Observable<{ message: string }> {
  return this.http.post<{ message: string }>(`${this.apiUrl}/resend-verification`, { email });
}
```

Update `register` method:
- Remove automatic token handling (don't call `handleAuth` in pipe)

#### Update RegisterComponent
**File**: `Client/health-tracker-ui/src/app/auth/register/register.component.ts`

Update `onSubmit`:
- On success, navigate to `/verify-email` with email as query param
- Show verification message instead of logging in

#### Create VerifyEmailComponent
**Generate component:**
```bash
cd Client/health-tracker-ui
ng generate component auth/verify-email
```

**Implementation**: `Client/health-tracker-ui/src/app/auth/verify-email/verify-email.component.ts`
- Read `token` and `email` from query params
- If token exists, automatically call `authService.verifyEmail(token)`
- Show loading/success/error states
- Provide "Resend Verification Email" button
- On success, show link to login page

**Key features**:
- Display email address where verification was sent
- Handle token verification errors (expired, invalid, already verified)
- Allow resending verification email
- Navigate to login after successful verification

#### Update App Routes
**File**: `Client/health-tracker-ui/src/app/app.routes.ts`

Add route:
```typescript
{
  path: 'verify-email',
  component: VerifyEmailComponent
}
```

#### Update LoginComponent
**File**: `Client/health-tracker-ui/src/app/auth/login/login.component.ts`

Update `onSubmit`:
- Check for `err.error?.requiresVerification`
- If true, redirect to `/verify-email` with email query param
- Show verification error message

---

### 6. Optional: Validation Layer

**New File**: `Server/HealthTracker.API/Validations/AuthValidator.cs`

Create static validator following existing pattern from `MedicationValidator.cs`:
- `ValidateRegister(username, email, password)`: Check required fields, formats, lengths
- `ValidateEmail(email)`: Email format validation
- `ValidateVerificationToken(token)`: Token presence check

Apply in AuthController endpoints.

---

## Email Provider Configuration

### Gmail Setup
1. Enable 2-Factor Authentication on Google Account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate App Password (16 characters)
4. Update `appsettings.json`:
   - SmtpServer: `smtp.gmail.com`
   - SmtpPort: `587`
   - Username: Your Gmail address
   - Password: The 16-character app password

### Outlook Setup
Update `appsettings.json`:
- SmtpServer: `smtp-mail.outlook.com`
- SmtpPort: `587`
- Username: Your Outlook email
- Password: Your password or app password (if using 2FA)

---

## Testing Checklist

### Backend (via Swagger/Postman)
1. ✓ POST /api/auth/register → Returns message (no token), email sent
2. ✓ POST /api/auth/login (before verification) → 401 with verification error
3. ✓ POST /api/auth/verify-email (valid token) → Success, user verified
4. ✓ POST /api/auth/verify-email (expired/invalid token) → Error
5. ✓ POST /api/auth/resend-verification → New email sent
6. ✓ POST /api/auth/login (after verification) → 200 with JWT token

### Frontend
1. ✓ Register → Redirect to verify-email page
2. ✓ Click email link → Verify success, show login link
3. ✓ Login before verification → Show error, redirect to verify-email
4. ✓ Resend verification → New email received
5. ✓ Login after verification → Success

### Database
1. ✓ Check User table has new columns
2. ✓ Verify `IsEmailVerified = 0` after registration
3. ✓ Verify `IsEmailVerified = 1` after verification
4. ✓ Verify tokens are hashed (not plaintext)

---

## Security Considerations

1. **Token Security**:
   - Tokens are cryptographically secure (32 random bytes)
   - Tokens are hashed before storage (SHA256)
   - Tokens expire after 24 hours
   - Tokens are invalidated after use

2. **Email Security**:
   - Use app passwords (not regular passwords)
   - SMTP credentials in appsettings.json (use environment variables in production)
   - Email sending failures don't block registration

3. **Error Messages**:
   - Generic errors for login failures (don't reveal if email exists)
   - Specific errors only in verification flow

---

## Critical Files Summary

### New Files to Create (8 files)
1. `Server/HealthTracker.API/Models/EmailSettings.cs`
2. `Server/HealthTracker.API/Repositories/IEmailService.cs`
3. `Server/HealthTracker.API/Services/EmailService.cs`
4. `Server/HealthTracker.API/Validations/AuthValidator.cs` (optional)
5. `Client/health-tracker-ui/src/app/auth/verify-email/verify-email.component.ts`
6. `Client/health-tracker-ui/src/app/auth/verify-email/verify-email.component.html`
7. `Client/health-tracker-ui/src/app/auth/verify-email/verify-email.component.css`
8. Migration file (auto-generated)

### Files to Modify (11 files)
1. `Server/HealthTracker.API/Models/User.cs`
2. `Server/HealthTracker.API/Data/ApplicationDbContext.cs`
3. `Server/HealthTracker.API/Repositories/IAuthService.cs`
4. `Server/HealthTracker.API/Services/AuthService.cs`
5. `Server/HealthTracker.API/Controllers/AuthController.cs`
6. `Server/HealthTracker.API/Program.cs`
7. `Server/HealthTracker.API/appsettings.json`
8. `Client/health-tracker-ui/src/app/shared/services/auth.service.ts`
9. `Client/health-tracker-ui/src/app/auth/register/register.component.ts`
10. `Client/health-tracker-ui/src/app/auth/login/login.component.ts`
11. `Client/health-tracker-ui/src/app/app.routes.ts`

---

## Implementation Order

1. **Phase 1 - Database** (30 min):
   - Update User model
   - Update DbContext
   - Create and apply migration

2. **Phase 2 - Email Service** (1 hour):
   - Install NuGet packages
   - Create EmailSettings, IEmailService, EmailService
   - Update appsettings.json
   - Register in Program.cs
   - Configure Gmail/Outlook app password

3. **Phase 3 - Backend Auth** (1.5 hours):
   - Update IAuthService interface
   - Update AuthService (all methods)
   - Update AuthController (all endpoints)
   - Optional: Create AuthValidator

4. **Phase 4 - Frontend** (1.5 hours):
   - Update AuthService
   - Create VerifyEmailComponent
   - Update RegisterComponent
   - Update LoginComponent
   - Update routes

5. **Phase 5 - Testing** (1 hour):
   - Backend API testing
   - Frontend flow testing
   - Email delivery testing
   - Database verification

**Total Estimated Time**: 5-6 hours

---

## Rollback Plan

If issues occur:
1. Revert migration: `dotnet ef migrations remove`
2. Temporarily disable verification check in `LoginAsync` (comment out `IsEmailVerified` check)
3. Fix issues and re-enable verification
