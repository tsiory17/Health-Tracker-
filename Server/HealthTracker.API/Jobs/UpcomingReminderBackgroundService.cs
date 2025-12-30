using HealthTracker.API.Repositories;

namespace HealthTracker.API.Jobs;

public class UpcomingReminderBackgroundService : BackgroundService
{
    private readonly ILogger<UpcomingReminderBackgroundService> _logger;
    private readonly IServiceProvider _serviceProvider;

    public UpcomingReminderBackgroundService(
        ILogger<UpcomingReminderBackgroundService> logger,
        IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("UpcomingReminderBackgroundService is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessUpcomingRemindersAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while processing upcoming medication reminders.");
            }

            // Wait 1 minute before checking again
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }

        _logger.LogInformation("UpcomingReminderBackgroundService is stopping.");
    }

    private async Task ProcessUpcomingRemindersAsync()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var notificationService = scope.ServiceProvider.GetRequiredService<IMedicationNotificationService>();

            var doses = await notificationService.FindDosesNeedingUpcomingReminderAsync();

            if (doses.Any())
            {
                _logger.LogInformation($"Found {doses.Count} doses needing upcoming reminders.");

                foreach (var dose in doses)
                {
                    try
                    {
                        var emailSent = await notificationService.SendUpcomingReminderEmailAsync(dose, dose.Medication.User);

                        if (emailSent)
                        {
                            await notificationService.MarkUpcomingReminderSentAsync(dose.DoseId);
                            _logger.LogInformation($"Successfully sent and marked upcoming reminder for dose {dose.DoseId}");
                        }
                        else
                        {
                            _logger.LogWarning($"Failed to send upcoming reminder for dose {dose.DoseId}");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error processing upcoming reminder for dose {dose.DoseId}");
                    }
                }
            }
            else
            {
                _logger.LogDebug("No doses needing upcoming reminders at this time.");
            }
        }
    }
}
