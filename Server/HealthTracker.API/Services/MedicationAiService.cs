using Google.GenAI;
using HealthTracker.API.Models;
using HealthTracker.API.Repositories;

namespace HealthTracker.API.Services
{
    public class MedicationAiService : IMedicationAiService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<MedicationAiService> _logger;

        public MedicationAiService(IConfiguration configuration, ILogger<MedicationAiService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<string?> GenerateRecommendationsAsync(string name, string dosage, string frequency, List<Medication> existingMedications)
        {
            try
            {
                var apiKey = _configuration["Gemini:ApiKey"]?.Trim();
                var model = _configuration["Gemini:Model"] ?? "gemini-2.5-flash";

                if (string.IsNullOrEmpty(apiKey) || apiKey == "YOUR_API_KEY_HERE")
                {
                    _logger.LogWarning("Gemini API key not configured");
                    return null;
                }

                // Set API key as environment variable (required by Google.GenAI Client)
                Environment.SetEnvironmentVariable("GOOGLE_API_KEY", apiKey);

                var client = new Client();

                var existingMedsList = existingMedications.Any()
                    ? string.Join(", ", existingMedications.Select(m => $"{m.Name} ({m.Dosage})"))
                    : "None";

                var prompt = $@"You are a medical information assistant.

Medication: {name}
Dosage: {dosage}
Frequency: {frequency}

User's existing medications: {existingMedsList}

Provide recommendations as bullet points (•) with these categories:
1. When to take (before/with/after meals, time of day)
2. Common side effects (3 most common)
3. Special warnings (if applicable)
4. Drug interactions (check against existing medications)
5. Foods/substances to avoid
6. Other relevant notes

Format: Prefix with [RED] for interactions, [YELLOW] for warnings, no prefix for general info.
Be brief - one line per point.";

                var response = await client.Models.GenerateContentAsync(model: model, contents: prompt);
                return response.Candidates[0].Content.Parts[0].Text;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate AI recommendations for medication {Name}", name);
                return null;
            }
        }
    }
}
