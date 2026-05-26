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
    }
}
