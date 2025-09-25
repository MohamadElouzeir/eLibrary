namespace ElibraryApi.Domain;

public class Borrow
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = default!;

    public int BookId { get; set; }
    public Book Book { get; set; } = default!;

    public DateTime BorrowedAt { get; set; } = DateTime.UtcNow;

    // Demo: reminder after 5 minutes
    public DateTime DueAt { get; set; } = DateTime.UtcNow.AddMinutes(5);

    public DateTime? ReturnedAt { get; set; }

    // track whether reminder was already sent
    public bool ReminderSent { get; set; } = false;
}
