namespace ElibraryApi.Services;

public static class PasswordPolicy
{
    // Keep it simple and clear.
    public static bool IsStrong(string password, out string reason)
    {
        reason = string.Empty;
        if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
        { reason = "Password must be at least 8 characters."; return false; }

        bool hasUpper = false, hasLower = false, hasDigit = false, hasSpecial = false;
        foreach (var c in password)
        {
            if (char.IsUpper(c)) hasUpper = true;
            else if (char.IsLower(c)) hasLower = true;
            else if (char.IsDigit(c)) hasDigit = true;
            else if ("!@#$%^&*()-_=+[]{};:,.<>/?\\|".Contains(c)) hasSpecial = true;
        }

        if (!hasUpper) { reason = "Password must contain an uppercase letter."; return false; }
        if (!hasLower) { reason = "Password must contain a lowercase letter."; return false; }
        if (!hasDigit) { reason = "Password must contain a digit."; return false; }
        if (!hasSpecial) { reason = "Password must contain a special character."; return false; }

        return true;
    }
}
