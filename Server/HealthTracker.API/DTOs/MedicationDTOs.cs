namespace HealthTracker.API.DTOs;

public record CreateMedicationRequest(
    string Name,
    string Dosage,
    string Frequency,
    DateTime StartDate,
    DateTime? EndDate,
    string? Notes
);

public record UpdateMedicationRequest(
    string Name,
    string Dosage,
    string Frequency,
    DateTime StartDate,
    DateTime? EndDate,
    string? Notes
);

public record MedicationResponse(
    int MedicationId,
    int UserId,
    string Name,
    string Dosage,
    string Frequency,
    DateTime StartDate,
    DateTime? EndDate,
    string? Notes
);

public record MarkDoseAsTakenRequest(
    int DoseId
);
