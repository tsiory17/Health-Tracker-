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
public class MedicationsController : ControllerBase
{
    private readonly IMedicationService _medicationService;

    public MedicationsController(IMedicationService medicationService)
    {
        _medicationService = medicationService;
    }

    /// <summary>
    /// Get all medications for the current user
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllMedications()
    {
        var userId = GetUserIdFromClaims();
        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var medications = await _medicationService.GetAllMedicationsAsync(userId.Value);
        return Ok(medications);
    }

    /// <summary>
    /// Get a specific medication by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetMedicationById(int id)
    {
        var userId = GetUserIdFromClaims();
        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var medication = await _medicationService.GetMedicationByIdAsync(id, userId.Value);
        if (medication == null)
        {
            return NotFound(new { message = "Medication not found" });
        }

        return Ok(medication);
    }

    /// <summary>
    /// Create a new medication
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateMedication([FromBody] CreateMedicationRequest request)
    {
        var userId = GetUserIdFromClaims();
        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var validationError = MedicationValidator.ValidateCreateMedication(request);
        if (validationError != null)
        {
            return BadRequest(new { message = validationError });
        }

        // Check for duplicate medication (same name and dosage - case insensitive)
        var isDuplicate = await _medicationService.IsDuplicateMedicationAsync(
            request.Name,
            request.Dosage,
            userId.Value
        );

        if (isDuplicate)
        {
            return BadRequest(new { message = "A medication with the same name and dosage already exists" });
        }

        var medication = new Medication
        {
            UserId = userId.Value,
            Name = request.Name,
            Dosage = request.Dosage,
            Frequency = request.Frequency,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Notes = request.Notes
        };

        var createdMedication = await _medicationService.CreateMedicationAsync(medication);
        return CreatedAtAction(
            nameof(GetMedicationById),
            new { id = createdMedication.MedicationId },
            createdMedication
        );
    }

    /// <summary>
    /// Update an existing medication
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMedication(int id, [FromBody] UpdateMedicationRequest request)
    {
        var userId = GetUserIdFromClaims();
        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var validationError = MedicationValidator.ValidateUpdateMedication(request);
        if (validationError != null)
        {
            return BadRequest(new { message = validationError });
        }

        // Check for duplicate medication (same name and dosage - case insensitive)
        // Exclude the current medication being updated
        var isDuplicate = await _medicationService.IsDuplicateMedicationAsync(
            request.Name,
            request.Dosage,
            userId.Value,
            excludeMedicationId: id
        );

        if (isDuplicate)
        {
            return BadRequest(new { message = "A medication with the same name and dosage already exists" });
        }

        var medication = new Medication
        {
            MedicationId = id,
            UserId = userId.Value,
            Name = request.Name,
            Dosage = request.Dosage,
            Frequency = request.Frequency,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Notes = request.Notes
        };

        var success = await _medicationService.UpdateMedicationAsync(medication, userId.Value);
        if (!success)
        {
            return NotFound(new { message = "Medication not found" });
        }

        return Ok(new { message = "Medication updated successfully" });
    }

    /// <summary>
    /// Delete a medication
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMedication(int id)
    {
        var userId = GetUserIdFromClaims();
        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var success = await _medicationService.DeleteMedicationAsync(id, userId.Value);
        if (!success)
        {
            return NotFound(new { message = "Medication not found" });
        }

        return Ok(new { message = "Medication deleted successfully" });
    }

    /// <summary>
    /// Get all doses for a specific medication
    /// </summary>
    [HttpGet("{id}/doses")]
    public async Task<IActionResult> GetMedicationDoses(int id)
    {
        var userId = GetUserIdFromClaims();
        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var doses = await _medicationService.GetDosesForMedicationAsync(id, userId.Value);
        return Ok(doses);
    }

    /// <summary>
    /// Mark a dose as taken
    /// </summary>
    [HttpPost("doses/{doseId}/mark-taken")]
    public async Task<IActionResult> MarkDoseAsTaken(int doseId)
    {
        var userId = GetUserIdFromClaims();
        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var success = await _medicationService.MarkDoseAsTakenAsync(doseId, userId.Value);
        if (!success)
        {
            return NotFound(new { message = "Dose not found or does not belong to user" });
        }

        return Ok(new { message = "Dose marked as taken" });
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
