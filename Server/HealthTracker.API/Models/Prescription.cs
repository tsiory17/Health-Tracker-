namespace HealthTracker.API.Models;

public class Prescription
{
    public int PrescriptionId { get; set; }
    public int UserId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    public string? ExtractedData { get; set; }

    // Navigation property
    public User User { get; set; } = null!;
}
