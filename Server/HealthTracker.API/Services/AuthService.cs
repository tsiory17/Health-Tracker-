using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using HealthTracker.API.Models;
using HealthTracker.API.Repositories;

namespace HealthTracker.API.Services;

public class AuthService : IAuthService
{
    private readonly IRepository<User> _userRepository;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(IRepository<User> userRepository, IConfiguration configuration, IEmailService emailService, ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _configuration = configuration;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<(bool Success, string Token, User? User)> RegisterAsync(string username, string email, string password, string? timeZoneId = null)
    {
        // Check if user already exists (case-insensitive)
        var normalizedEmail = email.ToLower().Trim();
        var existingUser = await _userRepository.ExistsAsync(u => u.Email.ToLower() == normalizedEmail);
        if (existingUser)
        {
            return (false, string.Empty, null);
        }

        // Hash the password
        var passwordHash = HashPassword(password);

        // Generate verification token
        var verificationToken = GenerateVerificationToken();
        // var hashedToken = HashVerificationToken(verificationToken);
        var expiryHours = int.Parse(_configuration["AppSettings:EmailVerificationTokenExpiryHours"] ?? "24");

        // Validate and set time zone ID (default to UTC if not provided or invalid)
        var validTimeZoneId = "UTC";
        if (!string.IsNullOrEmpty(timeZoneId))
        {
            try
            {
                TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
                validTimeZoneId = timeZoneId;
            }
            catch
            {
                _logger.LogWarning($"Invalid time zone ID provided: {timeZoneId}, defaulting to UTC");
            }
        }

        // Create new user
        var user = new User
        {
            Username = username,
            Email = normalizedEmail,
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow,
            IsEmailVerified = false,
            EmailVerificationToken = verificationToken,
            EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(expiryHours),
            TimeZoneId = validTimeZoneId
        };

        var createdUser = await _userRepository.AddAsync(user);

        // Send verification email (don't fail registration if email fails)
        await _emailService.SendVerificationEmailAsync(email, username, verificationToken);

        // Return success WITHOUT JWT token
        return (true, string.Empty, createdUser);
    }

    public async Task<(bool Success, string Token, User? User)> LoginAsync(string email, string password)
    {
        // Find user by email (case-insensitive)
        var normalizedEmail = email.ToLower().Trim();
        _logger.LogInformation("Login attempt for email: {Email}", normalizedEmail);

        var users = await _userRepository.FindAsync(u => u.Email.ToLower() == normalizedEmail);
        var user = users.FirstOrDefault();

        if (user == null)
        {
            _logger.LogWarning("User not found for email: {Email}", normalizedEmail);
            return (false, string.Empty, null);
        }

        _logger.LogInformation("User found: {UserId}, IsEmailVerified: {IsVerified}", user.UserId, user.IsEmailVerified);

        // Verify password
        if (!VerifyPassword(password, user.PasswordHash))
        {
            _logger.LogWarning("Password verification failed for user: {UserId}", user.UserId);
            return (false, string.Empty, null);
        }

        _logger.LogInformation("Password verified for user: {UserId}", user.UserId);

        // Check if email is verified
        if (!user.IsEmailVerified)
        {
            _logger.LogWarning("Email not verified for user: {UserId}", user.UserId);
            return (false, "EMAIL_NOT_VERIFIED", null);
        }

        // Generate JWT token
        var token = GenerateJwtToken(user);
        _logger.LogInformation("Login successful for user: {UserId}", user.UserId);

        return (true, token, user);
    }

    public string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
        var issuer = jwtSettings["Issuer"];
        var audience = jwtSettings["Audience"];
        var expirationMinutes = int.Parse(jwtSettings["ExpirationInMinutes"] ?? "60");

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
            new Claim("timeZoneId", user.TimeZoneId ?? "UTC"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string HashPassword(string password)
    {
        // Generate a 128-bit salt using a secure PRNG
        byte[] salt = new byte[128 / 8];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(salt);
        }

        // Hash password with PBKDF2
        string hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
            password: password,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: 10000,
            numBytesRequested: 256 / 8));

        // Combine salt and hash
        return $"{Convert.ToBase64String(salt)}.{hashed}";
    }

    private bool VerifyPassword(string password, string storedHash)
    {
        try
        {
            var parts = storedHash.Split('.');
            if (parts.Length != 2)
            {
                return false;
            }

            var salt = Convert.FromBase64String(parts[0]);
            var hash = parts[1];

            string computedHash = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 10000,
                numBytesRequested: 256 / 8));

            return hash == computedHash;
        }
        catch
        {
            return false;
        }
    }

    private string GenerateVerificationToken()
    {
        var randomBytes = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomBytes);
        }
        return Convert.ToBase64String(randomBytes);
    }

    private string HashVerificationToken(string token)
    {
        using (var sha256 = SHA256.Create())
        {
            var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(token));
            return Convert.ToBase64String(hashBytes);
        }
    }

    public async Task<(bool Success, string Message)> VerifyEmailAsync(string token)
    {
        if (string.IsNullOrEmpty(token))
        {
            return (false, "Invalid verification token.");
        }

        // var hashedToken = HashVerificationToken(token);
        var users = await _userRepository.FindAsync(u => u.EmailVerificationToken == token);
        var user = users.FirstOrDefault();

        if (user == null)
        {
            return (false, "Invalid verification token.");
        }

        if (user.IsEmailVerified)
        {
            return (false, "Email is already verified.");
        }

        if (user.EmailVerificationTokenExpiry == null || user.EmailVerificationTokenExpiry < DateTime.UtcNow)
        {
            return (false, "Verification token has expired. Please request a new verification email.");
        }

        user.IsEmailVerified = true;
        user.EmailVerificationToken = null;
        user.EmailVerificationTokenExpiry = null;

        await _userRepository.UpdateAsync(user);

        return (true, $"Email verified successfully. You can now login.|{user.Email}");
    }

    public async Task<(bool Success, string Message)> ResendVerificationEmailAsync(string email)
    {
        if (string.IsNullOrEmpty(email))
        {
            return (false, "Email is required.");
        }

        var normalizedEmail = email.ToLower().Trim();
        var users = await _userRepository.FindAsync(u => u.Email.ToLower() == normalizedEmail);
        var user = users.FirstOrDefault();

        if (user == null)
        {
            return (false, "User not found.");
        }

        if (user.IsEmailVerified)
        {
            return (false, "Email is already verified.");
        }

        var verificationToken = GenerateVerificationToken();
        var expiryHours = int.Parse(_configuration["AppSettings:EmailVerificationTokenExpiryHours"] ?? "24");

        user.EmailVerificationToken = verificationToken;
        user.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(expiryHours);

        await _userRepository.UpdateAsync(user);

        var emailSent = await _emailService.SendVerificationEmailAsync(email, user.Username, verificationToken);

        if (!emailSent)
        {
            return (false, "Failed to send verification email. Please try again later.");
        }

        return (true, "Verification email sent successfully. Please check your inbox.");
    }

    public async Task<(bool Success, string Message)> ForgotPasswordAsync(string email)
    {
        if (string.IsNullOrEmpty(email))
        {
            return (false, "Email is required.");
        }

        var normalizedEmail = email.ToLower().Trim();
        var users = await _userRepository.FindAsync(u => u.Email.ToLower() == normalizedEmail);
        var user = users.FirstOrDefault();

        // Security: Always return success to prevent email enumeration
        if (user == null)
        {
            return (true, "If the email exists, a password reset link has been sent.");
        }

        // Generate reset token
        var resetToken = GenerateResetToken();
        var expiryMinutes = int.Parse(_configuration["AppSettings:PasswordResetTokenExpiryMinutes"] ?? "30");

        user.PasswordResetToken = resetToken;
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(expiryMinutes);

        await _userRepository.UpdateAsync(user);

        // Send password reset email
        var emailSent = await _emailService.SendPasswordResetEmailAsync(email, user.Username, resetToken);

        if (!emailSent)
        {
            _logger.LogError("Failed to send password reset email to {Email}", email);
        }

        return (true, "If the email exists, a password reset link has been sent.");
    }

    public async Task<(bool Success, string Message)> ValidateResetTokenAsync(string token, string email)
    {
        if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(email))
        {
            return (false, "Invalid reset request.");
        }

        var normalizedEmail = email.ToLower().Trim();
        var users = await _userRepository.FindAsync(u => u.Email.ToLower() == normalizedEmail);
        var user = users.FirstOrDefault();

        if (user == null)
        {
            return (false, "Invalid reset request.");
        }

        if (user.PasswordResetToken != token)
        {
            return (false, "Invalid or expired reset token.");
        }

        if (user.PasswordResetTokenExpiry == null || user.PasswordResetTokenExpiry < DateTime.UtcNow)
        {
            return (false, "Reset token has expired. Please request a new one.");
        }

        return (true, "Token is valid.");
    }

    public async Task<(bool Success, string Message)> ResetPasswordAsync(string token, string email, string newPassword)
    {
        if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(email) || string.IsNullOrEmpty(newPassword))
        {
            return (false, "Invalid reset request.");
        }

        var normalizedEmail = email.ToLower().Trim();
        var users = await _userRepository.FindAsync(u => u.Email.ToLower() == normalizedEmail);
        var user = users.FirstOrDefault();

        if (user == null)
        {
            return (false, "Invalid reset request.");
        }

        if (user.PasswordResetToken != token)
        {
            return (false, "Invalid or expired reset token.");
        }

        if (user.PasswordResetTokenExpiry == null || user.PasswordResetTokenExpiry < DateTime.UtcNow)
        {
            return (false, "Reset token has expired. Please request a new one.");
        }

        // Validate password strength
        if (newPassword.Length < 6)
        {
            return (false, "Password must be at least 6 characters long.");
        }

        // Hash the new password
        user.PasswordHash = HashPassword(newPassword);

        // Clear reset token fields
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiry = null;

        await _userRepository.UpdateAsync(user);

        _logger.LogInformation("Password successfully reset for user: {UserId}", user.UserId);

        return (true, "Password has been successfully reset. You can now log in with your new password.");
    }

    private string GenerateResetToken()
    {
        var randomBytes = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomBytes);
        }
        return Convert.ToBase64String(randomBytes);
    }

    public async Task<(bool Success, string Message)> UpdateUserProfileAsync(int userId, string? timeZoneId)
    {
        var users = await _userRepository.FindAsync(u => u.UserId == userId);
        var user = users.FirstOrDefault();

        if (user == null)
        {
            return (false, "User not found.");
        }

        // Update timezone if provided
        if (!string.IsNullOrEmpty(timeZoneId))
        {
            // Validate timezone ID
            try
            {
                TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
                user.TimeZoneId = timeZoneId;
            }
            catch
            {
                return (false, $"Invalid timezone ID: {timeZoneId}");
            }
        }

        await _userRepository.UpdateAsync(user);
        _logger.LogInformation("Profile updated for user: {UserId}", userId);

        return (true, "Profile updated successfully.");
    }
}
