using HealthTracker.API.Models;

namespace HealthTracker.API.Repositories;

public interface IAuthService
{
    Task<(bool Success, string Token, User? User)> RegisterAsync(string username, string email, string password);
    Task<(bool Success, string Token, User? User)> LoginAsync(string email, string password);
    string GenerateJwtToken(User user);
}
