using System.Security.Cryptography;
using System.Text;

namespace ElibraryApi.Services;

public static class Otp
{
    public static string NewCode()
    {
        var b = new byte[4];
        RandomNumberGenerator.Fill(b);
        return (BitConverter.ToUInt32(b, 0) % 900000 + 100000).ToString(); // 6-digit code
    }

    public static string Hash(string code)
    {
        using var h = SHA256.Create();
        var bytes = h.ComputeHash(Encoding.UTF8.GetBytes(code));
        return Convert.ToBase64String(bytes);
    }
}
