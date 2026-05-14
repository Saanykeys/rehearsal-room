namespace RehearsalRoomAPI.Models
{
    public class RehearsalEvent
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public DateTime EventDate { get; set; }

        public string Notes { get; set; } = string.Empty;
    }
}