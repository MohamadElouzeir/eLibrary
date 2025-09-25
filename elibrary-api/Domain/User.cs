namespace ElibraryApi.Domain;

public class User
{
    public int Id { get; set; }
    public string UserName { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Role { get; set; } = "User";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Borrow> Borrows { get; set; } = new List<Borrow>();
    public bool EmailVerified { get; set; } = false;

}


public static class Passwords
{
    // PBKDF2 based hash (simple helper)
    public static string Hash(string password)
    {
        using var derive = new System.Security.Cryptography.Rfc2898DeriveBytes(password, 16, 600000, System.Security.Cryptography.HashAlgorithmName.SHA256);
        var salt = derive.Salt;
        var key = derive.GetBytes(32);
        return Convert.ToBase64String(salt) + ":" + Convert.ToBase64String(key);
    }

    public static bool Verify(string password, string hash)
    {
        var parts = hash.Split(':');
        if (parts.Length != 2) return false;
        var salt = Convert.FromBase64String(parts[0]);
        var key = Convert.FromBase64String(parts[1]);
        using var derive = new System.Security.Cryptography.Rfc2898DeriveBytes(password, salt, 600000, System.Security.Cryptography.HashAlgorithmName.SHA256);
        var test = derive.GetBytes(32);
        return System.Security.Cryptography.CryptographicOperations.FixedTimeEquals(test, key);
    }
}
