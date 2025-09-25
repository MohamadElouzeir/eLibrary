using System.Net;
using System.Net.Mail;

namespace ElibraryApi.Services;

public interface IEmailSender
{
    Task SendAsync(string to, string subject, string body);
}

public class SmtpEmailSender : IEmailSender
{
    private readonly IConfiguration _cfg;
    public SmtpEmailSender(IConfiguration cfg) { _cfg = cfg; }

    public async Task SendAsync(string to, string subject, string body)
    {
        // read config OR environment variable
        bool enabled = _cfg.GetValue<bool>("Smtp:Enabled", true);

        if (!enabled)
        {
            Console.WriteLine($"[DEV] Email to {to}\n{subject}\n{body}");
            return;
        }

        var host = Environment.GetEnvironmentVariable("SMTP_HOST") ?? _cfg["Smtp:Host"];
        var port = Environment.GetEnvironmentVariable("SMTP_PORT") ?? _cfg["Smtp:Port"];
        var user = Environment.GetEnvironmentVariable("SMTP_USER") ?? _cfg["Smtp:User"];
        var pass = Environment.GetEnvironmentVariable("SMTP_PASSWORD") ?? _cfg["Smtp:Password"];
        var from = Environment.GetEnvironmentVariable("SMTP_FROM") ?? _cfg["Smtp:From"];

        using var client = new SmtpClient(host, int.Parse(port!))
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(user, pass)
        };

        using var mail = new MailMessage(from, to, subject, body);
        await client.SendMailAsync(mail);
    }
}
