namespace RehearsalRoomAPI.Models
{
    public class Organization
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Unique invite code team members use to join this organization.
        /// Auto-generated on creation (e.g. "ABCD1234").
        /// </summary>
        public string InviteCode { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
