namespace HealthTracker.API.Models;

public class Vital
{
    public int VitalId { get; set; }
    public int UserId { get; set; }
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
    public int? BloodPressureSystolic { get; set; }
    public int? BloodPressureDiastolic { get; set; }
    public int? HeartRate { get; set; }
    public decimal? Weight { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
}
