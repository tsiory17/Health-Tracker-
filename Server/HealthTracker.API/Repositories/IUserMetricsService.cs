using HealthTracker.API.Models;
using HealthTracker.API.Controllers;

namespace HealthTracker.API.Repositories;

public interface IUserMetricsService
{
    Task<UserMetrics> CreateUserMetricsAsync(UserMetricsRequest request);
}
