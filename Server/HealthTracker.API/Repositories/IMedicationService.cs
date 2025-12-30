using HealthTracker.API.DTOs;
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
    Task<bool> IsDuplicateMedicationAsync(string name, string dosage, int userId, int? excludeMedicationId = null);

    // Medication logging methods
    Task<IEnumerable<MedicationDoseResponse>> GetTodaysDosesAsync(int userId, DateTime? date = null);
    Task<bool> UpdateDoseStatusAsync(int doseId, int userId, DoseStatus status, string? notes);
    Task<DosesSummary> GetDosesSummaryAsync(int userId, DateTime date);
    Task<DateTime> GetUserTodayAsync(int userId);
}
