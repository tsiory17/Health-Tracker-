using HealthTracker.API.Models;

namespace HealthTracker.API.Repositories;

public interface IMedicationService
{
    Task<IEnumerable<Medication>> GetAllMedicationsAsync(int userId);
    Task<Medication?> GetMedicationByIdAsync(int medicationId, int userId);
    Task<Medication> CreateMedicationAsync(Medication medication);
    Task<bool> UpdateMedicationAsync(Medication medication, int userId);
    Task<bool> DeleteMedicationAsync(int medicationId, int userId);
    Task<IEnumerable<MedicationDose>> GetDosesForMedicationAsync(int medicationId, int userId);
    Task<bool> MarkDoseAsTakenAsync(int doseId, int userId);
}
