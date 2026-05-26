using System.ComponentModel.DataAnnotations.Schema;

namespace RehearsalRoomAPI.Models
{
    public class RehearsalEvent
    {
        public int Id { get; set; }

        public int OrganizationId { get; set; } = 0;

        public string Title { get; set; } = string.Empty;

        public DateTime EventDate { get; set; }

        public string EventTime { get; set; } = "19:00";

        public string Location { get; set; } = string.Empty;

        public string Notes { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Not stored in the RehearsalEvents table — populated from RehearsalSongs join
        [NotMapped]
        public List<int> SongIds { get; set; } = new();
    }
}
