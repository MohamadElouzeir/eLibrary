using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ElibraryApi.Data;

namespace ElibraryApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly LibraryDbContext _db;
    public UsersController(LibraryDbContext db) { _db = db; }

    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(idClaim)) return Unauthorized();
        var id = int.Parse(idClaim);
        var u = await _db.Users.FindAsync(id);
        if (u == null) return NotFound();
        return Ok(new { u.Id, u.UserName, u.Email, u.Role });
    }
}
