using HealthTracker.API.Models;

namespace HealthTracker.API.Repositories;

public interface IAuthService
{
    Task<(bool Success, string Token, User? User)> RegisterAsync(string username, string email, string password, string? timeZoneId = null);
    Task<(bool Success, string Token, User? User)> LoginAsync(string email, string password);
    string GenerateJwtToken(User user);
    Task<(bool Success, string Message)> VerifyEmailAsync(string token);
    Task<(bool Success, string Message)> ResendVerificationEmailAsync(string email);
    Task<(bool Success, string Message)> ForgotPasswordAsync(string email);
    Task<(bool Success, string Message)> ValidateResetTokenAsync(string token, string email);
    Task<(bool Success, string Message)> ResetPasswordAsync(string token, string email, string newPassword);
    Task<(bool Success, string Message)> UpdateUserProfileAsync(int userId, string? timeZoneId);
}
