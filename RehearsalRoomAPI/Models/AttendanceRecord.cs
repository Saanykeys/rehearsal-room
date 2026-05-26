namespace RehearsalRoomAPI.Models
{
    public class AttendanceRecord
    {
        public int Id { get; set; }

        public int OrganizationId { get; set; } = 0;

        public int RehearsalEventId { get; set; }

        public string MemberName { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;

        public string Status { get; set; } = "Pending";

        public DateTime RespondedAt { get; set; } = DateTime.UtcNow;
    }
}
