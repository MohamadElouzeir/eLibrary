namespace ElibraryApi.Domain;

public class Book
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Author { get; set; } = "";
    public int CopiesTotal { get; set; }
    public int CopiesAvailable { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<BookGenre> BookGenres { get; set; } = new List<BookGenre>();
}
