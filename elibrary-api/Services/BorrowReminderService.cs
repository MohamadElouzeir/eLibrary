using Microsoft.EntityFrameworkCore;
using ElibraryApi.Data;

namespace ElibraryApi.Services;

public class BorrowReminderService : BackgroundService
{
    private readonly IServiceProvider _provider;
    private readonly ILogger<BorrowReminderService> _log;

    public BorrowReminderService(IServiceProvider provider, ILogger<BorrowReminderService> log)
    {
        _provider = provider;
        _log = log;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _provider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<LibraryDbContext>();
                var email = scope.ServiceProvider.GetRequiredService<IEmailSender>();

                var now = DateTime.UtcNow;

                var borrows = await db.Borrows
                    .Include(b => b.User)
                    .Include(b => b.Book)
                    .Where(b => !b.ReminderSent && b.DueAt <= now)
                    .ToListAsync(stoppingToken);

                foreach (var b in borrows)
                {
                    var body = $"Hi {b.User.UserName},\n\n" +
                               $"This is a reminder to return '{b.Book.Title}' " +
                               $"which was due on {b.DueAt:d}.\n\n" +
                               "Thank you,\nYour eLibrary";

                    await email.SendAsync(b.User.Email, "eLibrary return reminder", body);
                    b.ReminderSent = true;
                    _log.LogInformation("Reminder sent to {Email} for book {Book}", b.User.Email, b.Book.Title);
                }

                if (borrows.Any())
                    await db.SaveChangesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _log.LogError(ex, "Reminder service failed");
            }

            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken); // check every 1 min
        }
    }
}
