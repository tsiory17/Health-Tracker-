namespace HealthTracker.Core.Entities;

public class MedicationDose
{
    public int DoseId { get; set; }
    public int MedicationId { get; set; }
    public DateTime ScheduledTime { get; set; }
    public DateTime? TakenAt { get; set; }
    public bool IsTaken { get; set; }

    // Navigation properties
    public Medication Medication { get; set; } = null!;
}
