using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ElibraryApi.Data;
using ElibraryApi.Domain;

namespace ElibraryApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BorrowsController : ControllerBase
{
    private readonly LibraryDbContext _db;
    public BorrowsController(LibraryDbContext db) { _db = db; }

    int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

    [HttpPost]
    public async Task<IActionResult> Borrow([FromBody] int bookId)
    {
        var book = await _db.Books.FindAsync(bookId);
        if (book == null) return NotFound();
        if (book.CopiesAvailable <= 0) return BadRequest("not available");

        book.CopiesAvailable -= 1;
        _db.Borrows.Add(new Borrow { BookId = book.Id, UserId = CurrentUserId });
        await _db.SaveChangesAsync();
        return Ok(new { message = "borrowed" });
    }

    [HttpPost("{id}/return")]
    public async Task<IActionResult> Return(int id)
    {
        var br = await _db.Borrows.Include(x => x.Book).FirstOrDefaultAsync(x => x.Id == id && x.ReturnedAt == null && x.UserId == CurrentUserId);
        if (br == null) return NotFound();
        br.ReturnedAt = DateTime.UtcNow;
        br.Book.CopiesAvailable += 1;
        await _db.SaveChangesAsync();
        return Ok(new { message = "returned" });
    }

    [HttpGet("my")]
    public async Task<IActionResult> MyBorrows()
    {
        var rows = await _db.Borrows.Include(b => b.Book).Where(b => b.UserId == CurrentUserId && b.ReturnedAt == null).ToListAsync();
        return Ok(rows.Select(r => new { r.Id, Book = r.Book.Title, r.BorrowedAt, r.DueAt }));
    }
}
