namespace HealthTracker.API.DTOs;

public record RegisterRequest(string Username, string Email, string Password, string? TimeZoneId = null);
public record LoginRequest(string Email, string Password);
public record VerifyEmailRequest(string Token);
public record ResendVerificationRequest(string Email);
public record ForgotPasswordRequest(string Email);
public record ResetPasswordRequest(string Token, string Email, string NewPassword);
public record ValidateResetTokenRequest(string Token, string Email);
public record UpdateUserProfileRequest(string? TimeZoneId);
