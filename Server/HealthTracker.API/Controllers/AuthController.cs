using Microsoft.AspNetCore.Mvc;
using HealthTracker.API.Models;
using HealthTracker.API.Repositories;

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
        var (success, token, user) = await _authService.RegisterAsync(request.Username, request.Email, request.Password);

        if (!success)
        {
            return BadRequest(new { message = "User with this email already exists" });
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

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var (success, token, user) = await _authService.LoginAsync(request.Email, request.Password);

        if (!success)
        {
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
}

public record RegisterRequest(string Username, string Email, string Password);
public record LoginRequest(string Email, string Password);
