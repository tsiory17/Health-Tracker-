using HealthTracker.API.Models;
using HealthTracker.API.Repositories;

namespace HealthTracker.API.Services;

public class VitalService : IVitalService
{
    private readonly IRepository<Vital> _vitalRepository;

    public VitalService(IRepository<Vital> vitalRepository)
    {
        _vitalRepository = vitalRepository;
    }

    public async Task<IEnumerable<Vital>> GetAllVitalsAsync(int userId)
    {
        var vitals = await _vitalRepository.FindAsync(v => v.UserId == userId);
        return vitals.OrderByDescending(v => v.RecordedAt);
    }

    public async Task<Vital?> GetVitalByIdAsync(int vitalId, int userId)
    {
        var vitals = await _vitalRepository.FindAsync(v => v.VitalId == vitalId && v.UserId == userId);
        return vitals.FirstOrDefault();
    }

    public async Task<Vital> CreateVitalAsync(Vital vital)
    {
        vital.RecordedAt = DateTime.UtcNow;
        return await _vitalRepository.AddAsync(vital);
    }

    public async Task<bool> UpdateVitalAsync(Vital vital, int userId)
    {
        var existing = await GetVitalByIdAsync(vital.VitalId, userId);
        if (existing == null)
        {
            return false;
        }

        await _vitalRepository.UpdateAsync(vital);
        return true;
    }

    public async Task<bool> DeleteVitalAsync(int vitalId, int userId)
    {
        var vital = await GetVitalByIdAsync(vitalId, userId);
        if (vital == null)
        {
            return false;
        }

        await _vitalRepository.DeleteAsync(vital);
        return true;
    }
}
