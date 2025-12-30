using HealthTracker.API.Repositories;

namespace HealthTracker.API.Jobs;

public class MissedDoseNotificationBackgroundService : BackgroundService
{
    private readonly ILogger<MissedDoseNotificationBackgroundService> _logger;
    private readonly IServiceProvider _serviceProvider;

    public MissedDoseNotificationBackgroundService(
        ILogger<MissedDoseNotificationBackgroundService> logger,
        IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("MissedDoseNotificationBackgroundService is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var now = DateTime.UtcNow;
                var targetTime = new TimeSpan(8, 0, 0); // 8:00 AM UTC

                // Calculate next run time
                var nextRun = now.Date.Add(targetTime);
                if (now.TimeOfDay >= targetTime)
                {
                    // If it's already past 8 AM today, schedule for tomorrow
                    nextRun = nextRun.AddDays(1);
                }

                var delay = nextRun - now;
                _logger.LogInformation($"Next missed dose check scheduled at: {nextRun}");

                // Wait until the scheduled time
                await Task.Delay(delay, stoppingToken);

                // Process missed doses
                await ProcessMissedDosesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while processing missed medication notifications.");

                // Wait 1 hour before retrying in case of error
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
        }

        _logger.LogInformation("MissedDoseNotificationBackgroundService is stopping.");
    }

    private async Task ProcessMissedDosesAsync()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var notificationService = scope.ServiceProvider.GetRequiredService<IMedicationNotificationService>();

            _logger.LogInformation("Starting missed dose notification check...");

            var doses = await notificationService.FindMissedDosesAsync();

            if (doses.Any())
            {
                _logger.LogInformation($"Found {doses.Count} missed doses from yesterday.");

                foreach (var dose in doses)
                {
                    try
                    {
                        var emailSent = await notificationService.SendMissedDoseEmailAsync(dose, dose.Medication.User);

                        if (emailSent)
                        {
                            await notificationService.MarkMissedDoseEmailSentAsync(dose.DoseId);
                            _logger.LogInformation($"Successfully sent and marked missed dose notification for dose {dose.DoseId}");
                        }
                        else
                        {
                            _logger.LogWarning($"Failed to send missed dose notification for dose {dose.DoseId}");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error processing missed dose notification for dose {dose.DoseId}");
                    }
                }

                _logger.LogInformation($"Completed missed dose notification processing. Sent {doses.Count} notifications.");
            }
            else
            {
                _logger.LogInformation("No missed doses found from yesterday.");
            }
        }
    }
}
