namespace ElibraryApi.Domain;

public class EmailVerification
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = default!;

    public string CodeHash { get; set; } = "";
    public DateTime ExpiresAt { get; set; }
    public int Attempts { get; set; } = 0;
    public string Purpose { get; set; } = "ConfirmEmail";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
