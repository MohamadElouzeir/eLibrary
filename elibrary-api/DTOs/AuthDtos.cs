namespace ElibraryApi.DTOs;

public record RegisterRequest(string UserName, string Email, string Password);
public record LoginRequest(string UserNameOrEmail, string Password);
public record AuthResponse(string Token, int UserId, string UserName, string Role);
