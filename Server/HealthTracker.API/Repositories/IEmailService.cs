namespace HealthTracker.API.Repositories;

public interface IEmailService
{
    Task<bool> SendVerificationEmailAsync(string toEmail, string username, string verificationToken);
    Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody);
}
