using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ElibraryApi.Data;
using ElibraryApi.DTOs;
using ElibraryApi.Domain;

namespace ElibraryApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BooksController : ControllerBase
{
    private readonly LibraryDbContext _db;
    public BooksController(LibraryDbContext db) { _db = db; }

    [HttpGet]
    [HttpGet]
    public async Task<IEnumerable<BookView>> GetAll([FromQuery] string? q, [FromQuery] int? genreId)
    {
        var query = _db.Books
            .Include(b => b.BookGenres).ThenInclude(bg => bg.Genre)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(q))
        {
            var ql = q.Trim().ToLower();
            query = query.Where(b =>
                b.Title.ToLower().Contains(ql) ||
                b.Author.ToLower().Contains(ql) ||
                b.BookGenres.Any(bg => bg.Genre.Name.ToLower().Contains(ql))   // ← search by genre name
            );
        }

        if (genreId.HasValue)
            query = query.Where(b => b.BookGenres.Any(bg => bg.GenreId == genreId.Value));

        var data = await query.OrderBy(b => b.Title).ToListAsync();
        return data.Select(b => new BookView(
            b.Id, b.Title, b.Author, b.CopiesAvailable,
            b.BookGenres.Select(bg => bg.Genre.Name).ToArray()
        ));
    }


    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(BookCreate req)
    {
        var book = new Book
        {
            Title = req.Title,
            Author = req.Author,
            CopiesTotal = req.CopiesTotal,
            CopiesAvailable = req.CopiesAvailable
        };
        _db.Books.Add(book);
        await _db.SaveChangesAsync();

        foreach (var gid in req.GenreIds.Distinct())
            _db.BookGenres.Add(new BookGenre { BookId = book.Id, GenreId = gid });

        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = book.Id }, new { id = book.Id });
    }
}
