using HealthTracker.API.DTOs;

namespace HealthTracker.API.Validations;

public static class MedicationValidator
{
    public static string? ValidateCreateMedication(CreateMedicationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return "Medication name is required";
        }

        if (request.Name.Length > 200)
        {
            return "Medication name cannot exceed 200 characters";
        }

        if (string.IsNullOrWhiteSpace(request.Dosage))
        {
            return "Dosage is required";
        }

        if (request.Dosage.Length > 100)
        {
            return "Dosage cannot exceed 100 characters";
        }

        if (string.IsNullOrWhiteSpace(request.Frequency))
        {
            return "Frequency is required";
        }

        if (request.Frequency.Length > 100)
        {
            return "Frequency cannot exceed 100 characters";
        }

        if (request.EndDate.HasValue && request.EndDate.Value < request.StartDate)
        {
            return "End date cannot be before start date";
        }

        return null;
    }

    public static string? ValidateUpdateMedication(UpdateMedicationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return "Medication name is required";
        }

        if (request.Name.Length > 200)
        {
            return "Medication name cannot exceed 200 characters";
        }

        if (string.IsNullOrWhiteSpace(request.Dosage))
        {
            return "Dosage is required";
        }

        if (request.Dosage.Length > 100)
        {
            return "Dosage cannot exceed 100 characters";
        }

        if (string.IsNullOrWhiteSpace(request.Frequency))
        {
            return "Frequency is required";
        }

        if (request.Frequency.Length > 100)
        {
            return "Frequency cannot exceed 100 characters";
        }

        if (request.EndDate.HasValue && request.EndDate.Value < request.StartDate)
        {
            return "End date cannot be before start date";
        }

        return null;
    }
}
