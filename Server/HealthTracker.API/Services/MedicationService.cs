using HealthTracker.API.Models;
using HealthTracker.API.Repositories;

namespace HealthTracker.API.Services;

public class MedicationService : IMedicationService
{
    private readonly IRepository<Medication> _medicationRepository;
    private readonly IRepository<MedicationDose> _doseRepository;

    public MedicationService(
        IRepository<Medication> medicationRepository,
        IRepository<MedicationDose> doseRepository)
    {
        _medicationRepository = medicationRepository;
        _doseRepository = doseRepository;
    }

    public async Task<IEnumerable<Medication>> GetAllMedicationsAsync(int userId)
    {
        return await _medicationRepository.FindAsync(m => m.UserId == userId);
    }

    public async Task<Medication?> GetMedicationByIdAsync(int medicationId, int userId)
    {
        var medications = await _medicationRepository.FindAsync(m => m.MedicationId == medicationId && m.UserId == userId);
        return medications.FirstOrDefault();
    }

    public async Task<Medication> CreateMedicationAsync(Medication medication)
    {
        return await _medicationRepository.AddAsync(medication);
    }

    public async Task<bool> UpdateMedicationAsync(Medication medication, int userId)
    {
        var existing = await GetMedicationByIdAsync(medication.MedicationId, userId);
        if (existing == null)
        {
            return false;
        }

        await _medicationRepository.UpdateAsync(medication);
        return true;
    }

    public async Task<bool> DeleteMedicationAsync(int medicationId, int userId)
    {
        var medication = await GetMedicationByIdAsync(medicationId, userId);
        if (medication == null)
        {
            return false;
        }

        await _medicationRepository.DeleteAsync(medication);
        return true;
    }

    public async Task<IEnumerable<MedicationDose>> GetDosesForMedicationAsync(int medicationId, int userId)
    {
        // Verify medication belongs to user
        var medication = await GetMedicationByIdAsync(medicationId, userId);
        if (medication == null)
        {
            return Enumerable.Empty<MedicationDose>();
        }

        return await _doseRepository.FindAsync(d => d.MedicationId == medicationId);
    }

    public async Task<bool> MarkDoseAsTakenAsync(int doseId, int userId)
    {
        var doses = await _doseRepository.FindAsync(d => d.DoseId == doseId);
        var dose = doses.FirstOrDefault();

        if (dose == null)
        {
            return false;
        }

        // Verify dose belongs to user's medication
        var medications = await _medicationRepository.FindAsync(m => m.MedicationId == dose.MedicationId && m.UserId == userId);
        if (!medications.Any())
        {
            return false;
        }

        dose.IsTaken = true;
        dose.TakenAt = DateTime.UtcNow;
        await _doseRepository.UpdateAsync(dose);

        return true;
    }

    public async Task<bool> IsDuplicateMedicationAsync(string name, string dosage, int userId, int? excludeMedicationId = null)
    {
        var medications = await _medicationRepository.FindAsync(m => m.UserId == userId);

        var duplicate = medications.Any(m =>
            m.Name.ToLower() == name.ToLower() &&
            m.Dosage.ToLower() == dosage.ToLower() &&
            (!excludeMedicationId.HasValue || m.MedicationId != excludeMedicationId.Value)
        );

        return duplicate;
    }
}
