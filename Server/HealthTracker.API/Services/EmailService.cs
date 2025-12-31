using Microsoft.Extensions.Options;
using HealthTracker.API.Models;
using HealthTracker.API.Repositories;
using sib_api_v3_sdk.Api;
using sib_api_v3_sdk.Client;
using sib_api_v3_sdk.Model;

namespace HealthTracker.API.Services;

public class EmailService : IEmailService
{
    private readonly EmailSettings _emailSettings;
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly IWebHostEnvironment _environment;

    public EmailService(
        IOptions<EmailSettings> emailSettings,
        IConfiguration configuration,
        ILogger<EmailService> logger,
        IWebHostEnvironment environment)
    {
        _emailSettings = emailSettings.Value;
        _configuration = configuration;
        _logger = logger;
        _environment = environment;
    }

    public async Task<bool> SendVerificationEmailAsync(string toEmail, string username, string verificationToken)
    {
        try
        {
            var frontendUrl = _configuration["AppSettings:FrontendUrl"] ?? "http://localhost:4200";
            var encodedToken = Uri.EscapeDataString(verificationToken);
            var encodedEmail = Uri.EscapeDataString(toEmail);
            var verificationLink = $"{frontendUrl}/verify-email?token={encodedToken}&email={encodedEmail}";
            var expiryHours = _configuration["AppSettings:EmailVerificationTokenExpiryHours"] ?? "24";

            var templatePath = Path.Combine(_environment.ContentRootPath, "Templates", "VerificationEmailTemplate.html");
            var htmlTemplate = await File.ReadAllTextAsync(templatePath);

            var htmlBody = htmlTemplate
                .Replace("{USERNAME}", username)
                .Replace("{VERIFICATION_LINK}", verificationLink)
                .Replace("{EXPIRY_HOURS}", expiryHours);

            return await SendEmailAsync(toEmail, "Verify Your Email - Health Tracker", htmlBody);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending verification email to {Email}", toEmail);
            return false;
        }
    }

    public async Task<bool> SendPasswordResetEmailAsync(string toEmail, string username, string resetToken)
    {
        try
        {
            var frontendUrl = _configuration["AppSettings:FrontendUrl"] ?? "http://localhost:4200";
            var encodedToken = Uri.EscapeDataString(resetToken);
            var encodedEmail = Uri.EscapeDataString(toEmail);
            var resetLink = $"{frontendUrl}/reset-password?token={encodedToken}&email={encodedEmail}";
            var expiryMinutes = _configuration["AppSettings:PasswordResetTokenExpiryMinutes"] ?? "30";

            var templatePath = Path.Combine(_environment.ContentRootPath, "Templates", "PasswordResetEmailTemplate.html");
            var htmlTemplate = await File.ReadAllTextAsync(templatePath);

            var htmlBody = htmlTemplate
                .Replace("{USERNAME}", username)
                .Replace("{RESET_LINK}", resetLink)
                .Replace("{EXPIRY_HOURS}", expiryMinutes);

            return await SendEmailAsync(toEmail, "Password Reset Request - Health Tracker", htmlBody);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending password reset email to {Email}", toEmail);
            return false;
        }
    }

    public async Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        try
        {
            // Configure Brevo API
            Configuration.Default.ApiKey["api-key"] = _emailSettings.BrevoApiKey;

            var apiInstance = new TransactionalEmailsApi();
            var sendSmtpEmail = new SendSmtpEmail
            {
                Sender = new SendSmtpEmailSender(_emailSettings.SenderName, _emailSettings.SenderEmail),
                To = new List<SendSmtpEmailTo> { new SendSmtpEmailTo(toEmail) },
                Subject = subject,
                HtmlContent = htmlBody
            };

            var result = await apiInstance.SendTransacEmailAsync(sendSmtpEmail);

            _logger.LogInformation("Email sent successfully to {Email} via Brevo. MessageId: {MessageId}", toEmail, result.MessageId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email} via Brevo", toEmail);
            return false;
        }
    }
}
