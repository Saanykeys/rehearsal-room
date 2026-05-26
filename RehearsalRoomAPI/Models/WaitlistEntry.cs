namespace RehearsalRoomAPI.Models
{
    public class WaitlistEntry
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string ChurchName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>True once the admin has approved this person.</summary>
        public bool IsApproved { get; set; } = false;

        /// <summary>Single-use director code emailed on approval.</summary>
        public string? DirectorInviteCode { get; set; }

        /// <summary>UTC expiry for the director invite code (7 days).</summary>
        public DateTime? InviteCodeExpiry { get; set; }

        /// <summary>True once the code has been used to register.</summary>
        public bool InviteCodeUsed { get; set; } = false;

        /// <summary>UTC timestamp of when the approval was sent.</summary>
        public DateTime? ApprovedAt { get; set; }
    }
}
