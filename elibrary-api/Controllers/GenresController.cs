using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ElibraryApi.Data;
using ElibraryApi.Domain;

namespace ElibraryApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GenresController : ControllerBase
{
    private readonly LibraryDbContext _db;
    public GenresController(LibraryDbContext db) { _db = db; }

    [HttpGet]
    public async Task<IActionResult> All() => Ok(await _db.Genres.OrderBy(x => x.Name).ToListAsync());

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(Genre g)
    {
        _db.Genres.Add(g);
        await _db.SaveChangesAsync();
        return Ok(g);
    }
}
