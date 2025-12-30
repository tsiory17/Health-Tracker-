using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using HealthTracker.API.Models;
using HealthTracker.API.Repositories;
using HealthTracker.API.DTOs;

namespace HealthTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // Validate timezone if provided
        if (!string.IsNullOrEmpty(request.TimeZoneId))
        {
            try
            {
                TimeZoneInfo.FindSystemTimeZoneById(request.TimeZoneId);
            }
            catch (TimeZoneNotFoundException)
            {
                return BadRequest(new { message = $"Invalid timezone ID: {request.TimeZoneId}. Defaulting to UTC." });
            }
        }

        var (success, token, user) = await _authService.RegisterAsync(request.Username, request.Email, request.Password, request.TimeZoneId);

        if (!success)
        {
            return BadRequest(new { message = "User with this email already exists" });
        }

        return Ok(new
        {
            message = "Registration successful. Please check your email to verify your account.",
            email = user.Email
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var (success, token, user) = await _authService.LoginAsync(request.Email, request.Password);

        if (!success)
        {
            if (token == "EMAIL_NOT_VERIFIED")
            {
                return Unauthorized(new
                {
                    message = "Please verify your email before logging in. Check your inbox for the verification link.",
                    requiresVerification = true
                });
            }
            return Unauthorized(new { message = "Invalid email or password" });
        }

        return Ok(new
        {
            token,
            user = new
            {
                user.UserId,
                user.Username,
                user.Email
            }
        });
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
    {
        
        var (success, message) = await _authService.VerifyEmailAsync(request.Token);
        return success ? Ok(new { message }) : BadRequest(new { message });
    }

    [HttpPost("resend-verification")]
    public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationRequest request)
    {
        var (success, message) = await _authService.ResendVerificationEmailAsync(request.Email);
        return success ? Ok(new { message }) : BadRequest(new { message });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var (success, message) = await _authService.ForgotPasswordAsync(request.Email);
        return Ok(new { message });
    }

    [HttpPost("validate-reset-token")]
    public async Task<IActionResult> ValidateResetToken([FromBody] ValidateResetTokenRequest request)
    {
        var (success, message) = await _authService.ValidateResetTokenAsync(request.Token, request.Email);
        if (!success)
            return BadRequest(new { message });
        return Ok(new { message });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var (success, message) = await _authService.ResetPasswordAsync(
            request.Token,
            request.Email,
            request.NewPassword
        );

        if (!success)
            return BadRequest(new { message });

        return Ok(new { message });
    }

    [HttpPut("update-profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        // Validate timezone if provided
        if (!string.IsNullOrEmpty(request.TimeZoneId))
        {
            try
            {
                TimeZoneInfo.FindSystemTimeZoneById(request.TimeZoneId);
            }
            catch (TimeZoneNotFoundException)
            {
                return BadRequest(new { message = $"Invalid timezone ID: {request.TimeZoneId}. Please provide a valid Windows timezone ID." });
            }
        }

        var (success, message) = await _authService.UpdateUserProfileAsync(userId, request.TimeZoneId);

        if (!success)
            return BadRequest(new { message });

        return Ok(new { message });
    }
}
