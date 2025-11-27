using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using HealthTracker.API.Models;
using HealthTracker.API.Repositories;

namespace HealthTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserMetricsController : ControllerBase
{
    private readonly IUserMetricsService _userMetricsService;

    public UserMetricsController(IUserMetricsService userMetricsService)
    {
        _userMetricsService = userMetricsService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateUserMetrics([FromBody] UserMetricsRequest request)
    {
        var validationError = ValidateUserMetrics(request);
        if (validationError != null)
        {
            return BadRequest(new { message = validationError });
        }

        var userId = GetUserIdFromClaims();
        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var userMetrics = await _userMetricsService.CreateUserMetricsAsync(request, userId.Value);
        return Ok(userMetrics);
    }

    [HttpGet]
    public async Task<IActionResult> GetUserMetrics()
    {
        var userId = GetUserIdFromClaims();
        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var userMetrics = await _userMetricsService.GetUserMetricsByUserIdAsync(userId.Value);
        if (userMetrics == null)
        {
            return NotFound(new { message = "User metrics not found" });
        }

        return Ok(userMetrics);
    }

    [HttpGet("setup-status")]
    public async Task<IActionResult> GetSetupStatus()
    {
        var userId = GetUserIdFromClaims();
        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var hasCompleted = await _userMetricsService.HasCompletedSetupAsync(userId.Value);
        return Ok(new { hasCompletedSetup = hasCompleted });
    }

    private int? GetUserIdFromClaims()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
        {
            return userId;
        }
        return null;
    }

    private string? ValidateUserMetrics(UserMetricsRequest request)
    {
        if (request.HeightCm <= 0)
        {
            return "Height must be greater than 0";
        }

        if (request.WeightKg <= 0)
        {
            return "Weight must be greater than 0";
        }

        var today = DateTime.Today;
        var age = today.Year - request.DateOfBirth.Year;
        if (request.DateOfBirth.Date > today.AddYears(-age))
        {
            age--;
        }

        if (age < 1)
        {
            return "Age must be at least 1 year old";
        }

        return null;
    }
}

public record UserMetricsRequest(DateTime DateOfBirth, double HeightCm, double WeightKg);
