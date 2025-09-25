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
        if (!_cfg.GetValue<bool>("Smtp:Enabled"))
        {
            Console.WriteLine($"[DEV] Email to {to}\n{subject}\n{body}");
            return;
        }

        using var c = new SmtpClient(_cfg["Smtp:Host"], int.Parse(_cfg["Smtp:Port"]!))
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(_cfg["Smtp:User"], _cfg["Smtp:Password"])
        };
        using var m = new MailMessage(_cfg["Smtp:From"], to, subject, body);
        await c.SendMailAsync(m);
    }
}
