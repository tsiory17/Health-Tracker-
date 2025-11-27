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

    public async Task<UserMetrics> CreateUserMetricsAsync(UserMetricsRequest request, int userId)
    {
        var userMetrics = new UserMetrics
        {
            UserId = userId,
            DateOfBirth = request.DateOfBirth,
            HeightCm = request.HeightCm,
            WeightKg = request.WeightKg
        };

        return await _userMetricsRepository.AddAsync(userMetrics);
    }

    public async Task<UserMetrics?> GetUserMetricsByUserIdAsync(int userId)
    {
        var userMetrics = await _userMetricsRepository.FindAsync(um => um.UserId == userId);
        return userMetrics.FirstOrDefault();
    }

    public async Task<bool> HasCompletedSetupAsync(int userId)
    {
        return await _userMetricsRepository.ExistsAsync(um => um.UserId == userId);
    }
}
