namespace HealthTracker.API.Models;

public class EmailSettings
{
    // Brevo API settings
    public string BrevoApiKey { get; set; } = string.Empty;

    // SMTP settings (legacy - kept for local development)
    public string SmtpServer { get; set; } = string.Empty;
    public int SmtpPort { get; set; }
    public string SenderEmail { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool UseSsl { get; set; }
}
