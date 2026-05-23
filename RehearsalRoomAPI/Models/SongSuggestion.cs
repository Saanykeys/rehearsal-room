namespace RehearsalRoomAPI.Models
{
    public class SongSuggestion
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;
        public string Artist { get; set; } = string.Empty;
        public string YouTubeLink { get; set; } = string.Empty;
        
        public string Reason { get; set; } = string.Empty;
        public string SuggestedBy { get; set; } = string.Empty;

        public string Status { get; set; } = "Pending";

        public int Likes { get; set; } = 0;
        public int Dislikes { get; set; } = 0;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}