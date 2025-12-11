using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using HealthTracker.API.Models;
using HealthTracker.API.Repositories;
using HealthTracker.API.DTOs;
using HealthTracker.API.Validations;

namespace HealthTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VitalsController : ControllerBase
{
    private readonly IVitalService _vitalService;

    public VitalsController(IVitalService vitalService)
    {
        _vitalService = vitalService;
    }

    /// <summary>
    /// Get all vitals for the current user
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllVitals()
    {
        var userId = GetUserIdFromClaims();
        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var vitals = await _vitalService.GetAllVitalsAsync(userId.Value);
        return Ok(vitals);
    }

    /// <summary>
    /// Get a specific vital by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetVitalById(int id)
    {
        var userId = GetUserIdFromClaims();
        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var vital = await _vitalService.GetVitalByIdAsync(id, userId.Value);
        if (vital == null)
        {
            return NotFound(new { message = "Vital record not found" });
        }

        return Ok(vital);
    }

    /// <summary>
    /// Create a new vital record
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateVital([FromBody] CreateVitalRequest request)
    {
        var userId = GetUserIdFromClaims();
        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var validationError = VitalValidator.ValidateCreateVital(request);
        if (validationError != null)
        {
            return BadRequest(new { message = validationError });
        }

        var vital = new Vital
        {
            UserId = userId.Value,
            BloodPressureSystolic = request.BloodPressureSystolic,
            BloodPressureDiastolic = request.BloodPressureDiastolic,
            HeartRate = request.HeartRate,
            Weight = request.Weight
        };

        var createdVital = await _vitalService.CreateVitalAsync(vital);
        return CreatedAtAction(
            nameof(GetVitalById),
            new { id = createdVital.VitalId },
            createdVital
        );
    }

    /// <summary>
    /// Update an existing vital record
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateVital(int id, [FromBody] UpdateVitalRequest request)
    {
        var userId = GetUserIdFromClaims();
        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var validationError = VitalValidator.ValidateUpdateVital(request);
        if (validationError != null)
        {
            return BadRequest(new { message = validationError });
        }

        var vital = new Vital
        {
            VitalId = id,
            UserId = userId.Value,
            BloodPressureSystolic = request.BloodPressureSystolic,
            BloodPressureDiastolic = request.BloodPressureDiastolic,
            HeartRate = request.HeartRate,
            Weight = request.Weight,
            RecordedAt = DateTime.UtcNow
        };

        var success = await _vitalService.UpdateVitalAsync(vital, userId.Value);
        if (!success)
        {
            return NotFound(new { message = "Vital record not found" });
        }

        return Ok(new { message = "Vital record updated successfully" });
    }

    /// <summary>
    /// Delete a vital record
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVital(int id)
    {
        var userId = GetUserIdFromClaims();
        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var success = await _vitalService.DeleteVitalAsync(id, userId.Value);
        if (!success)
        {
            return NotFound(new { message = "Vital record not found" });
        }

        return Ok(new { message = "Vital record deleted successfully" });
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
}
