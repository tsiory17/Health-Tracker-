namespace HealthTracker.API.Models;

public class User
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsEmailVerified { get; set; } = false;
    public string? EmailVerificationToken { get; set; }
    public DateTime? EmailVerificationTokenExpiry { get; set; }
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpiry { get; set; }
    public bool EmailNotificationsEnabled { get; set; } = true;
    public string TimeZoneId { get; set; } = "UTC"; // Default to UTC, user can set their local time zone

    // Navigation properties
    public ICollection<Medication> Medications { get; set; } = new List<Medication>();
    public ICollection<Vital> Vitals { get; set; } = new List<Vital>();
    public ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
    public ICollection<UserMetrics> UserMetricsHistory { get; set; } = new List<UserMetrics>();
}
