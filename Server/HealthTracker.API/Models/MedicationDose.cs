namespace HealthTracker.API.Models;

public class MedicationDose
{
    public int DoseId { get; set; }
    public int MedicationId { get; set; }
    public DateTime ScheduledTime { get; set; }
    public DateTime? TakenAt { get; set; }
    public bool IsTaken { get; set; } // Kept for backward compatibility
    public DoseStatus Status { get; set; } = DoseStatus.Pending;
    public string? Notes { get; set; }

    // Email notification tracking
    public bool UpcomingReminderSent { get; set; } = false;
    public DateTime? UpcomingReminderSentAt { get; set; }
    public bool MissedDoseEmailSent { get; set; } = false;
    public DateTime? MissedDoseEmailSentAt { get; set; }

    // Navigation properties
    public Medication Medication { get; set; } = null!;
}
