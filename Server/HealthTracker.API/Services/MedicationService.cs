using HealthTracker.API.DTOs;
using HealthTracker.API.Models;
using HealthTracker.API.Repositories;

namespace HealthTracker.API.Services;

public class MedicationService : IMedicationService
{
    private readonly IRepository<Medication> _medicationRepository;
    private readonly IRepository<MedicationDose> _doseRepository;
    private readonly IRepository<User> _userRepository;

    public MedicationService(

        IRepository<Medication> medicationRepository,
        IRepository<MedicationDose> doseRepository,
        IRepository<User> userRepository)
    {
        _medicationRepository = medicationRepository;
        _doseRepository = doseRepository;
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<Medication>> GetAllMedicationsAsync(int userId)
    {
        return await _medicationRepository.FindAsync(m => m.UserId == userId);
    }

    public async Task<Medication?> GetMedicationByIdAsync(int medicationId, int userId)
    {
        var medications = await _medicationRepository.FindAsync(m => m.MedicationId == medicationId && m.UserId == userId);
        return medications.FirstOrDefault();
    }

    public async Task<Medication> CreateMedicationAsync(Medication medication)
    {
        var createdMedication = await _medicationRepository.AddAsync(medication);

        // Generate dose schedule based on user-specified times
        if (!string.IsNullOrEmpty(medication.DoseTimes))
        {
            await GenerateDosesForMedicationAsync(createdMedication);
        }

        return createdMedication;
    }

    public async Task<bool> UpdateMedicationAsync(Medication medication, int userId)
    {
        var existing = await GetMedicationByIdAsync(medication.MedicationId, userId);
        if (existing == null)
        {
            return false;
        }

        await _medicationRepository.UpdateAsync(medication);
        return true;
    }

    public async Task<bool> DeleteMedicationAsync(int medicationId, int userId)
    {
        var medication = await GetMedicationByIdAsync(medicationId, userId);
        if (medication == null)
        {
            return false;
        }

        await _medicationRepository.DeleteAsync(medication);
        return true;
    }

    public async Task<IEnumerable<MedicationDose>> GetDosesForMedicationAsync(int medicationId, int userId)
    {
        // Verify medication belongs to user
        var medication = await GetMedicationByIdAsync(medicationId, userId);
        if (medication == null)
        {
            return Enumerable.Empty<MedicationDose>();
        }

        return await _doseRepository.FindAsync(d => d.MedicationId == medicationId);
    }

    public async Task<bool> MarkDoseAsTakenAsync(int doseId, int userId)
    {
        var doses = await _doseRepository.FindAsync(d => d.DoseId == doseId);
        var dose = doses.FirstOrDefault();

        if (dose == null)
        {
            return false;
        }

        // Verify dose belongs to user's medication
        var medications = await _medicationRepository.FindAsync(m => m.MedicationId == dose.MedicationId && m.UserId == userId);
        if (!medications.Any())
        {
            return false;
        }

        dose.IsTaken = true;
        dose.Status = DoseStatus.Taken;
        dose.TakenAt = DateTime.UtcNow;
        dose.Notes = null; // Clear any existing notes
        await _doseRepository.UpdateAsync(dose);

        return true;
    }

    public async Task<bool> IsDuplicateMedicationAsync(string name, string dosage, int userId, int? excludeMedicationId = null)
    {
        var medications = await _medicationRepository.FindAsync(m => m.UserId == userId);

        var duplicate = medications.Any(m =>
            m.Name.ToLower() == name.ToLower() &&
            m.Dosage.ToLower() == dosage.ToLower() &&
            (!excludeMedicationId.HasValue || m.MedicationId != excludeMedicationId.Value)
        );

        return duplicate;
    }

    public async Task<IEnumerable<MedicationDoseResponse>> GetTodaysDosesAsync(int userId, DateTime? date = null)
    {
        // Get user's timezone to determine "today" in their local time
        var users = await _userRepository.FindAsync(u => u.UserId == userId);
        var user = users.FirstOrDefault();

        DateTime targetDate;
        if (date.HasValue)
        {
            targetDate = date.Value;
        }
        else if (user != null && !string.IsNullOrEmpty(user.TimeZoneId))
        {
            // Get "today" in user's local timezone
            var userTimeZone = TimeZoneInfo.FindSystemTimeZoneById(user.TimeZoneId);
            var nowInUserTimeZone = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, userTimeZone);
            targetDate = nowInUserTimeZone.Date;
        }
        else
        {
            // Fallback to server time if user has no timezone set
            targetDate = DateTime.Today;
        }

        // Convert user's local date to UTC range for querying
        TimeZoneInfo queryTimeZone;
        if (user != null && !string.IsNullOrEmpty(user.TimeZoneId))
        {
            queryTimeZone = TimeZoneInfo.FindSystemTimeZoneById(user.TimeZoneId);
        }
        else
        {
            queryTimeZone = TimeZoneInfo.Local;
        }

        // Create start and end of day in user's timezone, then convert to UTC
        var startOfDayLocal = targetDate.Date;
        var endOfDayLocal = startOfDayLocal.AddDays(1).AddTicks(-1);

        var startOfDayUtc = TimeZoneInfo.ConvertTimeToUtc(
            DateTime.SpecifyKind(startOfDayLocal, DateTimeKind.Unspecified),
            queryTimeZone
        );
        var endOfDayUtc = TimeZoneInfo.ConvertTimeToUtc(
            DateTime.SpecifyKind(endOfDayLocal, DateTimeKind.Unspecified),
            queryTimeZone
        );

        // Get all doses scheduled for the target date (in UTC)
        var doses = await _doseRepository.FindAsync(d =>
            d.ScheduledTime >= startOfDayUtc && d.ScheduledTime <= endOfDayUtc);

        // Get user's medications to filter doses
        var userMedications = await _medicationRepository.FindAsync(m => m.UserId == userId);
        var userMedicationIds = userMedications.Select(m => m.MedicationId).ToHashSet();

        // Filter doses that belong to user's medications and convert times to user's timezone
        var result = doses
            .Where(d => userMedicationIds.Contains(d.MedicationId))
            .Join(userMedications,
                dose => dose.MedicationId,
                medication => medication.MedicationId,
                (dose, medication) => new MedicationDoseResponse(
                    dose.DoseId,
                    dose.MedicationId,
                    medication.Name,
                    medication.Dosage,
                    TimeZoneInfo.ConvertTimeFromUtc(dose.ScheduledTime, queryTimeZone),
                    dose.TakenAt.HasValue ? TimeZoneInfo.ConvertTimeFromUtc(dose.TakenAt.Value, queryTimeZone) : null,
                    dose.Status,
                    dose.Notes
                ))
            .OrderBy(d => d.ScheduledTime);

        return result;
    }

    public async Task<bool> UpdateDoseStatusAsync(int doseId, int userId, DoseStatus status, string? notes)
    {
        var doses = await _doseRepository.FindAsync(d => d.DoseId == doseId);
        var dose = doses.FirstOrDefault();

        if (dose == null)
        {
            return false;
        }

        // Verify dose belongs to user's medication
        var medications = await _medicationRepository.FindAsync(m => m.MedicationId == dose.MedicationId && m.UserId == userId);
        if (!medications.Any())
        {
            return false;
        }

        dose.Status = status;
        dose.Notes = notes;

        // Update TakenAt based on status
        if (status == DoseStatus.Taken)
        {
            dose.TakenAt = DateTime.UtcNow;
            dose.IsTaken = true;
        }
        else
        {
            dose.TakenAt = null;
            dose.IsTaken = false;
        }

        await _doseRepository.UpdateAsync(dose);
        return true;
    }

    public async Task<DosesSummary> GetDosesSummaryAsync(int userId, DateTime date)
    {
        // Get user's timezone to convert local date to UTC range
        var users = await _userRepository.FindAsync(u => u.UserId == userId);
        var user = users.FirstOrDefault();

        // Determine the timezone to use for conversion
        TimeZoneInfo queryTimeZone;
        if (user != null && !string.IsNullOrEmpty(user.TimeZoneId))
        {
            try
            {
                queryTimeZone = TimeZoneInfo.FindSystemTimeZoneById(user.TimeZoneId);
            }
            catch (TimeZoneNotFoundException)
            {
                // Fallback to UTC if timezone is invalid
                queryTimeZone = TimeZoneInfo.Utc;
            }
        }
        else
        {
            // Fallback to UTC if user has no timezone set
            queryTimeZone = TimeZoneInfo.Utc;
        }

        // Create start and end of day in user's timezone, then convert to UTC
        var targetDate = date.Date;
        var startOfDayLocal = new DateTime(
            targetDate.Year,
            targetDate.Month,
            targetDate.Day,
            0, 0, 0,
            DateTimeKind.Unspecified
        );
        var endOfDayLocal = startOfDayLocal.AddDays(1).AddTicks(-1);

        var startOfDayUtc = TimeZoneInfo.ConvertTimeToUtc(startOfDayLocal, queryTimeZone);
        var endOfDayUtc = TimeZoneInfo.ConvertTimeToUtc(endOfDayLocal, queryTimeZone);

        // Get all doses scheduled for the target date (in UTC)
        var doses = await _doseRepository.FindAsync(d =>
            d.ScheduledTime >= startOfDayUtc && d.ScheduledTime <= endOfDayUtc);

        // Get user's medications to filter doses
        var userMedications = await _medicationRepository.FindAsync(m => m.UserId == userId);
        var userMedicationIds = userMedications.Select(m => m.MedicationId).ToHashSet();

        // Filter doses that belong to user
        var userDoses = doses.Where(d => userMedicationIds.Contains(d.MedicationId)).ToList();

        var summary = new DosesSummary(
            TotalScheduled: userDoses.Count,
            Taken: userDoses.Count(d => d.Status == DoseStatus.Taken),
            Skipped: userDoses.Count(d => d.Status == DoseStatus.Skipped),
            Missed: userDoses.Count(d => d.Status == DoseStatus.Missed),
            Pending: userDoses.Count(d => d.Status == DoseStatus.Pending)
        );

        return summary;
    }

    public async Task<DateTime> GetUserTodayAsync(int userId)
    {
        // Get user's timezone to determine "today" in their local time
        var users = await _userRepository.FindAsync(u => u.UserId == userId);
        var user = users.FirstOrDefault();

        if (user != null && !string.IsNullOrEmpty(user.TimeZoneId))
        {
            // Get "today" in user's local timezone
            var userTimeZone = TimeZoneInfo.FindSystemTimeZoneById(user.TimeZoneId);
            var nowInUserTimeZone = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, userTimeZone);
            return nowInUserTimeZone.Date;
        }
        else
        {
            // Fallback to server time if user has no timezone set
            return DateTime.Today;
        }
    }

    private async Task GenerateDosesForMedicationAsync(Medication medication)
    {
        if (string.IsNullOrEmpty(medication.DoseTimes))
        {
            return;
        }

        // Parse dose times from JSON
        var doseTimesArray = System.Text.Json.JsonSerializer.Deserialize<string[]>(medication.DoseTimes);
        if (doseTimesArray == null || doseTimesArray.Length == 0)
        {
            return;
        }

        // Get user's time zone
        var users = await _userRepository.FindAsync(u => u.UserId == medication.UserId);
        var user = users.FirstOrDefault();
        if (user == null)
        {
            return;
        }

        var userTimeZone = TimeZoneInfo.FindSystemTimeZoneById(user.TimeZoneId);
        var nowInUserTimeZone = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, userTimeZone);

        // Treat StartDate as if it's in the user's local timezone (ignore any UTC offset from frontend)
        // Extract just the date components and treat them as local
        var medicationStartDateLocal = new DateTime(
            medication.StartDate.Year,
            medication.StartDate.Month,
            medication.StartDate.Day,
            0, 0, 0,
            DateTimeKind.Unspecified
        );

        // Start from today or medication start date, whichever is later
        var startDate = medicationStartDateLocal > nowInUserTimeZone.Date ? medicationStartDateLocal : nowInUserTimeZone.Date;

        // End at medication end date or 90 days from now, whichever is sooner
        var maxEndDate = nowInUserTimeZone.Date.AddDays(90);

        DateTime endDate;
        if (medication.EndDate.HasValue)
        {
            // Treat EndDate as local too
            var medicationEndDateLocal = new DateTime(
                medication.EndDate.Value.Year,
                medication.EndDate.Value.Month,
                medication.EndDate.Value.Day,
                0, 0, 0,
                DateTimeKind.Unspecified
            );
            endDate = medicationEndDateLocal < maxEndDate ? medicationEndDateLocal : maxEndDate;
        }
        else
        {
            endDate = maxEndDate;
        }

        // Generate doses for each day in the range
        var currentDate = startDate;
        var dosesToCreate = new List<MedicationDose>();

        while (currentDate <= endDate)
        {
            // Create a dose for each specified time
            foreach (var timeString in doseTimesArray)
            {
                if (TimeSpan.TryParse(timeString, out var timeOfDay))
                {
                    // Create the scheduled time in the user's local time zone
                    // Example: User enters "4:30 PM" -> stored as 4:30 PM in user's timezone
                    var scheduledDateTimeInUserTimeZone = new DateTime(
                        currentDate.Year,
                        currentDate.Month,
                        currentDate.Day,
                        timeOfDay.Hours,
                        timeOfDay.Minutes,
                        timeOfDay.Seconds,
                        DateTimeKind.Unspecified
                    );

                    // Convert to UTC for storage
                    // Example: 4:30 PM EST (Montreal) -> 9:30 PM UTC
                    var scheduledDateTimeUtc = TimeZoneInfo.ConvertTimeToUtc(scheduledDateTimeInUserTimeZone, userTimeZone);

                    dosesToCreate.Add(new MedicationDose
                    {
                        MedicationId = medication.MedicationId,
                        ScheduledTime = scheduledDateTimeUtc,
                        Status = DoseStatus.Pending,
                        IsTaken = false
                    });
                }
            }

            currentDate = currentDate.AddDays(1);
        }

        // Batch create all doses
        foreach (var dose in dosesToCreate)
        {
            await _doseRepository.AddAsync(dose);
        }
    }
}
