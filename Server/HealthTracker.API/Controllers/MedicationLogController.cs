using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using HealthTracker.API.DTOs;
using HealthTracker.API.Models;
using HealthTracker.API.Repositories;

namespace HealthTracker.API.Controllers;

[ApiController]
[Route("api/medication-logs")]
[Authorize]
public class MedicationLogController : ControllerBase
{
    private readonly IMedicationService _medicationService;

    public MedicationLogController(IMedicationService medicationService)
    {
        _medicationService = medicationService;
    }

    /// <summary>
    /// Get today's scheduled medications with their log status
    /// GET /api/medication-logs/today
    /// Optional query param: date (YYYY-MM-DD format)
    /// </summary>
    [HttpGet("today")]
    public async Task<IActionResult> GetTodaysDoses([FromQuery] DateTime? date)
    {
        var userId = GetUserIdFromClaims();
        if (!userId.HasValue)
        {
            return Unauthorized("User ID not found in token");
        }

        var doses = await _medicationService.GetTodaysDosesAsync(userId.Value, date);
        return Ok(doses);
    }

    /// <summary>
    /// Mark medication as taken (auto-fills current time)
    /// POST /api/medication-logs/{doseId}/take
    /// </summary>
    [HttpPost("{doseId}/take")]
    public async Task<IActionResult> MarkDoseAsTaken(int doseId)
    {
        var userId = GetUserIdFromClaims();
        if (!userId.HasValue)
        {
            return Unauthorized("User ID not found in token");
        }

        var result = await _medicationService.MarkDoseAsTakenAsync(doseId, userId.Value);
        if (!result)
        {
            return NotFound("Dose not found or does not belong to user");
        }

        return Ok(new { message = "Dose marked as taken" });
    }

    /// <summary>
    /// Update a log entry (skip, missed, or change status)
    /// PUT /api/medication-logs/{doseId}
    /// </summary>
    [HttpPut("{doseId}")]
    public async Task<IActionResult> UpdateDoseStatus(int doseId, [FromBody] UpdateDoseStatusRequest request)
    {
        var userId = GetUserIdFromClaims();
        if (!userId.HasValue)
        {
            return Unauthorized("User ID not found in token");
        }

        var result = await _medicationService.UpdateDoseStatusAsync(
            doseId, userId.Value, request.Status, request.Notes);

        if (!result)
        {
            return NotFound("Dose not found or does not belong to user");
        }

        return Ok(new { message = "Dose status updated" });
    }

    /// <summary>
    /// Get summary statistics for a specific date
    /// GET /api/medication-logs/summary?date=YYYY-MM-DD
    /// </summary>
    [HttpGet("summary")]
    public async Task<IActionResult> GetDosesSummary([FromQuery] DateTime? date)
    {
        var userId = GetUserIdFromClaims();
        if (!userId.HasValue)
        {
            return Unauthorized("User ID not found in token");
        }

        var summary = await _medicationService.GetDosesSummaryAsync(
            userId.Value, date ?? DateTime.Today);

        return Ok(summary);
    }

    /// <summary>
    /// Get user's current date in their timezone
    /// GET /api/medication-logs/user-today
    /// </summary>
    [HttpGet("user-today")]
    public async Task<IActionResult> GetUserToday()
    {
        var userId = GetUserIdFromClaims();
        if (!userId.HasValue)
        {
            return Unauthorized("User ID not found in token");
        }

        var userToday = await _medicationService.GetUserTodayAsync(userId.Value);
        return Ok(new { date = userToday.ToString("yyyy-MM-dd") });
    }

    /// <summary>
    /// Helper method to extract user ID from JWT claims
    /// </summary>
    private int? GetUserIdFromClaims()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
        {
            return userId;
        }
        return null;
    }
}
