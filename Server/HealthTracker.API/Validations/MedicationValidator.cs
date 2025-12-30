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

        // Prevent adding medications with past start dates
        // Allow dates from yesterday onwards to account for timezone differences
        // (Users in timezones ahead of UTC might send "today" as "yesterday" in UTC)
        var minAllowedDate = DateTime.UtcNow.Date.AddDays(-1);
        if (request.StartDate.Date < minAllowedDate)
        {
            return "Cannot add medication with a past start date";
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

        // Note: We don't validate past start dates for updates since
        // existing medications may have been created in the past

        if (request.EndDate.HasValue && request.EndDate.Value < request.StartDate)
        {
            return "End date cannot be before start date";
        }

        return null;
    }
}
