namespace ElibraryApi.DTOs;

public record BookCreate(string Title, string Author, int CopiesTotal, int CopiesAvailable, int[] GenreIds);
public record BookView(int Id, string Title, string Author, int CopiesAvailable, string[] Genres);
