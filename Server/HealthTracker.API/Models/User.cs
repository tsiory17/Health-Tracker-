namespace HealthTracker.API.Models;

public class User
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Medication> Medications { get; set; } = new List<Medication>();
    public ICollection<Vital> Vitals { get; set; } = new List<Vital>();
}
