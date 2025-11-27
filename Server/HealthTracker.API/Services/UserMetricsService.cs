using HealthTracker.API.Models;
using HealthTracker.API.Repositories;
using HealthTracker.API.Controllers;

namespace HealthTracker.API.Services;

public class UserMetricsService : IUserMetricsService
{
    private readonly IRepository<UserMetrics> _userMetricsRepository;

    public UserMetricsService(IRepository<UserMetrics> userMetricsRepository)
    {
        _userMetricsRepository = userMetricsRepository;
    }

    public async Task<UserMetrics> CreateUserMetricsAsync(UserMetricsRequest request)
    {
        var userMetrics = new UserMetrics
        {
            UserId = 1,
            DateOfBirth = request.DateOfBirth,
            HeightCm = request.HeightCm,
            WeightKg = request.WeightKg
        };

        return await _userMetricsRepository.AddAsync(userMetrics);
    }
}
