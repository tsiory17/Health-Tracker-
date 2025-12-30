using HealthTracker.API.Data;
using HealthTracker.API.Models;
using HealthTracker.API.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace HealthTracker.API.Services;

public class MedicationNotificationService : IMedicationNotificationService
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly MedicationNotificationSettings _settings;
    private readonly ILogger<MedicationNotificationService> _logger;

    public MedicationNotificationService(
        ApplicationDbContext context,
        IEmailService emailService,
        IOptions<MedicationNotificationSettings> settings,
        ILogger<MedicationNotificationService> logger)
    {
        _context = context;
        _emailService = emailService;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<List<MedicationDose>> FindDosesNeedingUpcomingReminderAsync()
    {
        if (!_settings.EnableEmailNotifications)
            return new List<MedicationDose>();

        var now = DateTime.UtcNow;
        var reminderWindow = now.AddMinutes(_settings.UpcomingReminderMinutes);

        // Find doses scheduled within the reminder window that haven't been reminded yet
        var doses = await _context.MedicationDoses
            .Include(d => d.Medication)
                .ThenInclude(m => m.User)
            .Where(d =>
                d.ScheduledTime <= reminderWindow &&
                d.ScheduledTime > now &&
                d.Status == DoseStatus.Pending &&
                !d.UpcomingReminderSent &&
                d.Medication.User.EmailNotificationsEnabled)
            .ToListAsync();

        return doses;
    }

    public async Task<List<MedicationDose>> FindMissedDosesAsync()
    {
        if (!_settings.EnableEmailNotifications)
            return new List<MedicationDose>();

        var yesterday = DateTime.UtcNow.Date.AddDays(-1);
        var yesterdayEnd = yesterday.AddDays(1);

        // Find doses from yesterday that weren't taken and haven't been notified
        var doses = await _context.MedicationDoses
            .Include(d => d.Medication)
                .ThenInclude(m => m.User)
            .Where(d =>
                d.ScheduledTime >= yesterday &&
                d.ScheduledTime < yesterdayEnd &&
                !d.IsTaken &&
                d.Status != DoseStatus.Taken &&
                !d.MissedDoseEmailSent &&
                d.Medication.User.EmailNotificationsEnabled)
            .ToListAsync();

        return doses;
    }

    public async Task<bool> SendUpcomingReminderEmailAsync(MedicationDose dose, User user)
    {
        try
        {
            var templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "UpcomingMedicationReminderTemplate.html");

            if (!File.Exists(templatePath))
            {
                _logger.LogError($"Upcoming reminder template not found at: {templatePath}");
                return false;
            }

            var template = await File.ReadAllTextAsync(templatePath);

            // Convert UTC scheduled time to user's local time zone
            var userTimeZone = TimeZoneInfo.FindSystemTimeZoneById(user.TimeZoneId);
            var scheduledTimeInUserTimeZone = TimeZoneInfo.ConvertTimeFromUtc(dose.ScheduledTime, userTimeZone);

            var minutesUntil = (int)(dose.ScheduledTime - DateTime.UtcNow).TotalMinutes;

            var emailBody = template
                .Replace("{USERNAME}", user.Username)
                .Replace("{MEDICATION_NAME}", dose.Medication.Name)
                .Replace("{DOSAGE}", dose.Medication.Dosage)
                .Replace("{SCHEDULED_TIME}", scheduledTimeInUserTimeZone.ToString("hh:mm tt"))
                .Replace("{MINUTES_UNTIL}", minutesUntil.ToString());

            var result = await _emailService.SendEmailAsync(
                user.Email,
                "Upcoming Medication Reminder - Health Tracker",
                emailBody
            );

            if (result)
            {
                _logger.LogInformation($"Upcoming reminder sent to {user.Email} for dose {dose.DoseId}");
            }
            else
            {
                _logger.LogWarning($"Failed to send upcoming reminder to {user.Email} for dose {dose.DoseId}");
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error sending upcoming reminder email for dose {dose.DoseId}");
            return false;
        }
    }

    public async Task<bool> SendMissedDoseEmailAsync(MedicationDose dose, User user)
    {
        try
        {
            var templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "MissedMedicationNotificationTemplate.html");

            if (!File.Exists(templatePath))
            {
                _logger.LogError($"Missed dose template not found at: {templatePath}");
                return false;
            }

            var template = await File.ReadAllTextAsync(templatePath);

            // Convert UTC scheduled time to user's local time zone
            var userTimeZone = TimeZoneInfo.FindSystemTimeZoneById(user.TimeZoneId);
            var scheduledTimeInUserTimeZone = TimeZoneInfo.ConvertTimeFromUtc(dose.ScheduledTime, userTimeZone);

            var emailBody = template
                .Replace("{USERNAME}", user.Username)
                .Replace("{MEDICATION_NAME}", dose.Medication.Name)
                .Replace("{DOSAGE}", dose.Medication.Dosage)
                .Replace("{SCHEDULED_TIME}", scheduledTimeInUserTimeZone.ToString("hh:mm tt"))
                .Replace("{MISSED_DATE}", scheduledTimeInUserTimeZone.ToString("MMMM dd, yyyy"));

            var result = await _emailService.SendEmailAsync(
                user.Email,
                "Missed Medication Alert - Health Tracker",
                emailBody
            );

            if (result)
            {
                _logger.LogInformation($"Missed dose notification sent to {user.Email} for dose {dose.DoseId}");
            }
            else
            {
                _logger.LogWarning($"Failed to send missed dose notification to {user.Email} for dose {dose.DoseId}");
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error sending missed dose email for dose {dose.DoseId}");
            return false;
        }
    }

    public async Task MarkUpcomingReminderSentAsync(int doseId)
    {
        var dose = await _context.MedicationDoses.FindAsync(doseId);
        if (dose != null)
        {
            dose.UpcomingReminderSent = true;
            dose.UpcomingReminderSentAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Marked upcoming reminder as sent for dose {doseId}");
        }
    }

    public async Task MarkMissedDoseEmailSentAsync(int doseId)
    {
        var dose = await _context.MedicationDoses.FindAsync(doseId);
        if (dose != null)
        {
            dose.MissedDoseEmailSent = true;
            dose.MissedDoseEmailSentAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Marked missed dose email as sent for dose {doseId}");
        }
    }
}
