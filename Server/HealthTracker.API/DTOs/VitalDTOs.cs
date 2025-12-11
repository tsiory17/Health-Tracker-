namespace HealthTracker.API.DTOs;

public record CreateVitalRequest(
    int? BloodPressureSystolic,
    int? BloodPressureDiastolic,
    int? HeartRate,
    decimal? Weight
);

public record UpdateVitalRequest(
    int? BloodPressureSystolic,
    int? BloodPressureDiastolic,
    int? HeartRate,
    decimal? Weight
);
