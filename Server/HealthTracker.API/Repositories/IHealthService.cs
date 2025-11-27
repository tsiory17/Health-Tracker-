using HealthTracker.API.Models;

namespace HealthTracker.API.Repositories;

public interface IHealthService
{
    double CalculateBMI(UserMetrics userMetrics);
}
