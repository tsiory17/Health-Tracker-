using HealthTracker.API.Models;

namespace HealthTracker.API.Repositories
{
    public interface IMedicationAiService
    {
        Task<string?> GenerateRecommendationsAsync(string name, string dosage, string frequency, List<Medication> existingMedications);
    }
}
