namespace RehearsalRoomAPI.Models
{
    public class RehearsalMessage
    {
        public int Id { get; set; }

        public int OrganizationId { get; set; } = 0;

        public int RehearsalEventId { get; set; } = 0;

        public int AuthorId { get; set; } = 0;

        public string AuthorName { get; set; } = string.Empty;

        public string Body { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
