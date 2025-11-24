using HealthTracker.API.Models;

namespace HealthTracker.API.Repositories;

public interface IVitalService
{
    Task<IEnumerable<Vital>> GetAllVitalsAsync(int userId);
    Task<Vital?> GetVitalByIdAsync(int vitalId, int userId);
    Task<Vital> CreateVitalAsync(Vital vital);
    Task<bool> UpdateVitalAsync(Vital vital, int userId);
    Task<bool> DeleteVitalAsync(int vitalId, int userId);
}
