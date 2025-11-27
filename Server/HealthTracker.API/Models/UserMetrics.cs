namespace HealthTracker.API.Models;

public class UserMetrics
{
    public int UserMetricsId { get; set; }
    public int UserId { get; set; }
    public DateTime DateOfBirth { get; set; }
    public double HeightCm { get; set; }
    public double WeightKg { get; set; }

    public int Age
    {
        get
        {
            var today = DateTime.Today;
            var age = today.Year - DateOfBirth.Year;
            if (DateOfBirth.Date > today.AddYears(-age)) age--;
            return age;
        }
    }

    // Navigation property
    public User User { get; set; } = null!;
}
