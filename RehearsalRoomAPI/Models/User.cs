namespace RehearsalRoomAPI.Models
{
    public class User
    {
        public int Id { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public string Role { get; set; } = "Team Member";

        /// <summary>
        /// The organization this user belongs to. 0 = not yet assigned.
        /// </summary>
        public int OrganizationId { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// True once the user has clicked the verification link in their email.
        /// Existing users default to true so they are not locked out.
        /// </summary>
        public bool IsEmailVerified { get; set; } = true;

        /// <summary>
        /// One-time token sent in the verification email. Cleared after use.
        /// </summary>
        public string? EmailVerificationToken { get; set; }

        /// <summary>
        /// Google account subject ID — set when the user signs in with Google.
        /// </summary>
        public string? GoogleId { get; set; }

        /// <summary>
        /// One-time token sent in the password reset email. Cleared after use.
        /// </summary>
        public string? PasswordResetToken { get; set; }

        /// <summary>
        /// UTC expiry for the password reset token (1 hour window).
        /// </summary>
        public DateTime? PasswordResetTokenExpiry { get; set; }
    }
}
