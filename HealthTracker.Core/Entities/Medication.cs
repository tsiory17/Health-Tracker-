namespace HealthTracker.Core.Entities;

public class Medication
{
    public int MedicationId { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Dosage { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Notes { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<MedicationDose> MedicationDoses { get; set; } = new List<MedicationDose>();
}
