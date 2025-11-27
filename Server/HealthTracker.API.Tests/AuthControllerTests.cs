using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using HealthTracker.API.Controllers;
using HealthTracker.API.Models;
using HealthTracker.API.Repositories;

namespace HealthTracker.API.Tests;

public class AuthControllerTests
{
    private readonly Mock<IAuthService> _authServiceMock;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _authServiceMock = new Mock<IAuthService>();
        _controller = new AuthController(_authServiceMock.Object);
    }

    [Fact]
    public async Task Register_ReturnsOk_WhenRegistrationSucceeds()
    {
        // Arrange
        var request = new RegisterRequest("testuser", "test@example.com", "password123");
        var user = new User
        {
            UserId = 1,
            Username = "testuser",
            Email = "test@example.com"
        };
        _authServiceMock.Setup(s => s.RegisterAsync(request.Username, request.Email, request.Password))
            .ReturnsAsync((true, "token123", user));

        // Act
        var result = await _controller.Register(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task Register_ReturnsBadRequest_WhenUserAlreadyExists()
    {
        // Arrange
        var request = new RegisterRequest("testuser", "test@example.com", "password123");
        _authServiceMock.Setup(s => s.RegisterAsync(request.Username, request.Email, request.Password))
            .ReturnsAsync((false, null, null));

        // Act
        var result = await _controller.Register(request);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Login_ReturnsOk_WhenCredentialsAreValid()
    {
        // Arrange
        var request = new LoginRequest("test@example.com", "password123");
        var user = new User
        {
            UserId = 1,
            Username = "testuser",
            Email = "test@example.com"
        };
        _authServiceMock.Setup(s => s.LoginAsync(request.Email, request.Password))
            .ReturnsAsync((true, "token123", user));

        // Act
        var result = await _controller.Login(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task Login_ReturnsUnauthorized_WhenCredentialsAreInvalid()
    {
        // Arrange
        var request = new LoginRequest("test@example.com", "wrongpassword");
        _authServiceMock.Setup(s => s.LoginAsync(request.Email, request.Password))
            .ReturnsAsync((false, null, null));

        // Act
        var result = await _controller.Login(request);

        // Assert
        Assert.IsType<UnauthorizedObjectResult>(result);
    }
}
