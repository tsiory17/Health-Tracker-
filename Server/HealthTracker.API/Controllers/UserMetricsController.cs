using Microsoft.AspNetCore.Mvc;
using HealthTracker.API.Models;
using HealthTracker.API.Repositories;

namespace HealthTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
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

        var userMetrics = await _userMetricsService.CreateUserMetricsAsync(request);
        return Ok(userMetrics);
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
