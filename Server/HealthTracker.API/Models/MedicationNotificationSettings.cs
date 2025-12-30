namespace HealthTracker.API.Models;

public class MedicationNotificationSettings
{
    public bool EnableEmailNotifications { get; set; } = true;
    public int UpcomingReminderMinutes { get; set; } = 15;
    public TimeSpan MissedDoseCheckTime { get; set; } = new TimeSpan(8, 0, 0); // 8:00 AM
    public string EmailFrom { get; set; } = string.Empty;
    public string EmailFromName { get; set; } = "Health Tracker";
}
