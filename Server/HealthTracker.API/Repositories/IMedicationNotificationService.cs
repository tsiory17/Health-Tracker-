using HealthTracker.API.Models;

namespace HealthTracker.API.Repositories;

public interface IMedicationNotificationService
{
    /// <summary>
    /// Finds all doses that need an upcoming reminder (15 minutes before scheduled time)
    /// </summary>
    Task<List<MedicationDose>> FindDosesNeedingUpcomingReminderAsync();

    /// <summary>
    /// Finds all doses that were missed yesterday and haven't been notified
    /// </summary>
    Task<List<MedicationDose>> FindMissedDosesAsync();

    /// <summary>
    /// Sends an upcoming medication reminder email
    /// </summary>
    Task<bool> SendUpcomingReminderEmailAsync(MedicationDose dose, User user);

    /// <summary>
    /// Sends a missed medication notification email
    /// </summary>
    Task<bool> SendMissedDoseEmailAsync(MedicationDose dose, User user);

    /// <summary>
    /// Marks an upcoming reminder as sent
    /// </summary>
    Task MarkUpcomingReminderSentAsync(int doseId);

    /// <summary>
    /// Marks a missed dose email as sent
    /// </summary>
    Task MarkMissedDoseEmailSentAsync(int doseId);
}
