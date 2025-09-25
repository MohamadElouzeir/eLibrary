using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ElibraryApi.Data;
using ElibraryApi.Domain;
using ElibraryApi.DTOs;
using ElibraryApi.Services;
using System.Text.RegularExpressions;


namespace ElibraryApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly LibraryDbContext _db;
    private readonly TokenService _tokens;
    private readonly IEmailSender _email;

    public AuthController(LibraryDbContext db, TokenService tokens, IEmailSender email)
    {
        _db = db;
        _tokens = tokens;
        _email = email;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        var userName = (req.UserName ?? "").Trim().ToLower();
        var email = (req.Email ?? "").Trim().ToLower();
        var password = (req.Password ?? "");

        if (string.IsNullOrWhiteSpace(userName) ||
            string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(password))
            return BadRequest("username/email/password required");

        if (!PasswordPolicy.IsStrong(password, out var why))
            return BadRequest(why);

        var exists = await _db.Users.AnyAsync(u =>
            u.UserName.ToLower() == userName || u.Email.ToLower() == email);
        if (exists) return Conflict("user exists");

        var u = new User
        {
            UserName = userName,
            Email = email,
            PasswordHash = Passwords.Hash(password),
            EmailVerified = false
        };

        _db.Users.Add(u);
        await _db.SaveChangesAsync();

        // generate + save OTP
        var code = Otp.NewCode();
        _db.EmailVerifications.Add(new EmailVerification
        {
            UserId = u.Id,
            CodeHash = Otp.Hash(code),
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            Purpose = "ConfirmEmail"
        });
        await _db.SaveChangesAsync();

        // send OTP email
        await _email.SendAsync(u.Email, "eLibrary verification code",
            $"Your code is {code} (expires in 10 minutes).");

        return Ok(new { message = "verification code sent" });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req)
    {
        var key = (req.UserNameOrEmail ?? "").Trim().ToLower();
        var pass = req.Password ?? "";

        var u = await _db.Users.FirstOrDefaultAsync(x =>
            x.UserName.ToLower() == key || x.Email.ToLower() == key);

        if (u == null)
            return Unauthorized("invalid credentials (user)");

        if (!Passwords.Verify(pass, u.PasswordHash))
            return Unauthorized("invalid credentials (password)");

        if (!u.EmailVerified)
            return Unauthorized("please confirm your email before logging in");

        var token = _tokens.CreateToken(u.Id, u.UserName, u.Role);
        return new AuthResponse(token, u.Id, u.UserName, u.Role);
    }
    [HttpPost("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailRequest req)
    {
        var email = (req.Email ?? "").Trim().ToLowerInvariant();
        var raw = (req.Code ?? "").Trim();

        // Normalize: keep digits only (handles spaces, hyphens, NBSP, copying artifacts)
        var code = Regex.Replace(raw, @"\D", "");
        if (string.IsNullOrWhiteSpace(email) || code.Length != 6)
            return BadRequest("invalid code");

        var u = await _db.Users.FirstOrDefaultAsync(x => x.Email.ToLower() == email);
        if (u == null) return BadRequest("invalid email");
        if (u.EmailVerified) return Ok(new { message = "already verified" });

        var ver = await _db.EmailVerifications
            .Where(v => v.UserId == u.Id && v.Purpose == "ConfirmEmail")
            .OrderByDescending(v => v.CreatedAt)
            .FirstOrDefaultAsync();

        if (ver == null) return BadRequest("no code found");
        if (DateTime.UtcNow > ver.ExpiresAt) return BadRequest("code expired");

        // 🔹 Debug print to check normalization + hash comparison
        Console.WriteLine($"[OTP DEBUG] in='{raw}' norm='{code}' hashIn='{Otp.Hash(code)}' stored='{ver.CodeHash}'");

        var ok = Otp.Hash(code) == ver.CodeHash;
        if (!ok) return BadRequest("invalid code");

        u.EmailVerified = true;
        _db.EmailVerifications.Remove(ver);   // consume it
        await _db.SaveChangesAsync();

        return Ok(new { message = "email verified" });
    }




}
