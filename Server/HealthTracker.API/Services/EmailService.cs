using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using HealthTracker.API.Models;
using HealthTracker.API.Repositories;

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

    public async Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_emailSettings.SenderName, _emailSettings.SenderEmail));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = htmlBody
            };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            client.ServerCertificateValidationCallback = (s, c, h, e) => true;
            
            await client.ConnectAsync(_emailSettings.SmtpServer, _emailSettings.SmtpPort,
                _emailSettings.UseSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None);

            await client.AuthenticateAsync(_emailSettings.Username, _emailSettings.Password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Email sent successfully to {Email}", toEmail);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            return false;
        }
    }
}
