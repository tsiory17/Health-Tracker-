namespace HealthTracker.API.Repositories;

public interface IEmailService
{
    Task<bool> SendVerificationEmailAsync(string toEmail, string username, string verificationToken);
    Task<bool> SendPasswordResetEmailAsync(string toEmail, string username, string resetToken);
    Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody);
}
