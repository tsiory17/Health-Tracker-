using HealthTracker.API.DTOs;

namespace HealthTracker.API.Validations;

public static class VitalValidator
{
    public static string? ValidateCreateVital(CreateVitalRequest request)
    {
        // At least one vital measurement is required
        if (request.BloodPressureSystolic == null &&
            request.BloodPressureDiastolic == null &&
            request.HeartRate == null &&
            request.Weight == null)
        {
            return "At least one vital measurement is required";
        }

        // Validate blood pressure systolic
        if (request.BloodPressureSystolic.HasValue)
        {
            if (request.BloodPressureSystolic < 0 || request.BloodPressureSystolic > 300)
            {
                return "Blood pressure systolic must be between 0 and 300";
            }
        }

        // Validate blood pressure diastolic
        if (request.BloodPressureDiastolic.HasValue)
        {
            if (request.BloodPressureDiastolic < 0 || request.BloodPressureDiastolic > 200)
            {
                return "Blood pressure diastolic must be between 0 and 200";
            }
        }

        // Validate heart rate
        if (request.HeartRate.HasValue)
        {
            if (request.HeartRate < 0 || request.HeartRate > 300)
            {
                return "Heart rate must be between 0 and 300 bpm";
            }
        }

        // Validate weight
        if (request.Weight.HasValue)
        {
            if (request.Weight < 0 || request.Weight > 1000)
            {
                return "Weight must be between 0 and 1000 kg";
            }
        }

        return null;
    }

    public static string? ValidateUpdateVital(UpdateVitalRequest request)
    {
        // At least one vital measurement is required
        if (request.BloodPressureSystolic == null &&
            request.BloodPressureDiastolic == null &&
            request.HeartRate == null &&
            request.Weight == null)
        {
            return "At least one vital measurement is required";
        }

        // Validate blood pressure systolic
        if (request.BloodPressureSystolic.HasValue)
        {
            if (request.BloodPressureSystolic < 0 || request.BloodPressureSystolic > 300)
            {
                return "Blood pressure systolic must be between 0 and 300";
            }
        }

        // Validate blood pressure diastolic
        if (request.BloodPressureDiastolic.HasValue)
        {
            if (request.BloodPressureDiastolic < 0 || request.BloodPressureDiastolic > 200)
            {
                return "Blood pressure diastolic must be between 0 and 200";
            }
        }

        // Validate heart rate
        if (request.HeartRate.HasValue)
        {
            if (request.HeartRate < 0 || request.HeartRate > 300)
            {
                return "Heart rate must be between 0 and 300 bpm";
            }
        }

        // Validate weight
        if (request.Weight.HasValue)
        {
            if (request.Weight < 0 || request.Weight > 1000)
            {
                return "Weight must be between 0 and 1000 kg";
            }
        }

        return null;
    }
}
