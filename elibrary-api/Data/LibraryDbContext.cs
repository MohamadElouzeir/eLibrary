using Microsoft.EntityFrameworkCore;
using ElibraryApi.Domain;

namespace ElibraryApi.Data;

public class LibraryDbContext : DbContext
{
    public LibraryDbContext(DbContextOptions<LibraryDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Book> Books => Set<Book>();
    public DbSet<Genre> Genres => Set<Genre>();
    public DbSet<BookGenre> BookGenres => Set<BookGenre>();
    public DbSet<Borrow> Borrows => Set<Borrow>();
    public DbSet<EmailVerification> EmailVerifications => Set<EmailVerification>();



    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<BookGenre>().HasKey(x => new { x.BookId, x.GenreId });
        b.Entity<BookGenre>()
            .HasOne(x => x.Book).WithMany(x => x.BookGenres).HasForeignKey(x => x.BookId);
        b.Entity<BookGenre>()
            .HasOne(x => x.Genre).WithMany(x => x.BookGenres).HasForeignKey(x => x.GenreId);

        b.Entity<User>().HasIndex(x => x.UserName).IsUnique();
        b.Entity<User>().HasIndex(x => x.Email).IsUnique();

        base.OnModelCreating(b);
    }
}

public static class Seed
{
    public static async Task Run(LibraryDbContext db)
    {
        // --- Admin always exists and is verified ---
        var admin = await db.Users.FirstOrDefaultAsync(u => u.UserName.ToLower() == "admin");
        if (admin == null)
        {
            db.Users.Add(new User
            {
                UserName = "admin",
                Email = "admin@local",
                Role = "Admin",
                PasswordHash = Passwords.Hash("Admin@123"),
                EmailVerified = true   // ✅ always verified
            });
        }
        else
        {
            admin.EmailVerified = true;  // ✅ fix existing admin
            admin.Role = "Admin";
            // optional: reset password
            // admin.PasswordHash = Passwords.Hash("Admin@123");
        }
        await db.SaveChangesAsync();

        // --- Genres seeding ---


    }
}

