using HealthTracker.API.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace HealthTracker.API.Jobs
{
    public static class MedicationRecommendationJob
    {
        public static async Task ProcessMedicationRecommendationsAsync(int medicationId, int userId, IServiceProvider serviceProvider)
        {
            Console.WriteLine($"[DEBUG] ProcessMedicationRecommendationsAsync called for medication {medicationId}");
            try
            {
                Console.WriteLine($"[DEBUG] Creating service scope for medication {medicationId}");
                using var scope = serviceProvider.CreateScope();
                Console.WriteLine($"[DEBUG] Service scope created successfully for medication {medicationId}");
                var medicationService = scope.ServiceProvider.GetRequiredService<IMedicationService>();
                var aiService = scope.ServiceProvider.GetRequiredService<IMedicationAiService>();
                var notificationService = scope.ServiceProvider.GetRequiredService<IRealTimeNotificationService>();
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<IServiceProvider>>();

                logger.LogInformation("Starting AI recommendation generation for medication {MedicationId}", medicationId);

                var medication = await medicationService.GetMedicationByIdAsync(medicationId, userId);
                if (medication == null)
                {
                    logger.LogWarning("Medication {MedicationId} not found", medicationId);
                    return;
                }

                var allUserMedications = await medicationService.GetAllMedicationsAsync(userId);
                var otherMedications = allUserMedications.Where(m => m.MedicationId != medicationId).ToList();

                logger.LogInformation("Calling AI service for medication {Name}", medication.Name);
                var recommendations = await aiService.GenerateRecommendationsAsync(
                    medication.Name,
                    medication.Dosage,
                    medication.Frequency,
                    otherMedications.ToList()
                );

                if (recommendations != null)
                {
                    // Replace existing notes with new AI recommendations
                    medication.Notes = recommendations;

                    await medicationService.UpdateMedicationAsync(medication, userId);
                    logger.LogInformation("Updated medication {MedicationId} with AI recommendations", medicationId);

                    await notificationService.SendNotificationToUserAsync(userId, "MedicationRecommendationsReady", new
                    {
                        medicationId = medication.MedicationId,
                        recommendations = recommendations
                    });

                    logger.LogInformation("Sent SignalR notification to user {UserId}", userId);
                }
                else
                {
                    logger.LogWarning("AI service returned null for medication {MedicationId}", medicationId);
                }
            }
            catch (Exception ex)
            {
                var logger = serviceProvider.CreateScope().ServiceProvider.GetRequiredService<ILogger<IServiceProvider>>();
                logger.LogError(ex, "Error processing AI recommendations for medication {MedicationId}", medicationId);
            }
        }
    }
}
