namespace RehearsalRoomAPI.Models
{
    public class Announcement
    {
        public int Id { get; set; }

        public int OrganizationId { get; set; } = 0;

        public string Title { get; set; } = string.Empty;

        public string Body { get; set; } = string.Empty;

        public string CreatedBy { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
