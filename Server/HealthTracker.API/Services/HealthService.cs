using HealthTracker.API.Models;
using HealthTracker.API.Repositories;

namespace HealthTracker.API.Services;

public class HealthService : IHealthService
{
    public double CalculateBMI(UserMetrics userMetrics)
    {
        return userMetrics.WeightKg / Math.Pow(userMetrics.HeightCm / 100, 2);
    }
}
