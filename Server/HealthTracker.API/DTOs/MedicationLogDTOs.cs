namespace HealthTracker.API.DTOs;

using HealthTracker.API.Models;

/// <summary>
/// Response DTO for a medication dose with medication details
/// </summary>
public record MedicationDoseResponse(
    int DoseId,
    int MedicationId,
    string MedicationName,
    string Dosage,
    DateTime ScheduledTime,
    DateTime? TakenAt,
    DoseStatus Status,
    string? Notes
);

/// <summary>
/// Request DTO for updating dose status (skip/missed)
/// </summary>
public record UpdateDoseStatusRequest(
    DoseStatus Status,
    string? Notes
);

/// <summary>
/// Summary statistics for doses on a specific date
/// </summary>
public record DosesSummary(
    int TotalScheduled,
    int Taken,
    int Skipped,
    int Missed,
    int Pending
);
