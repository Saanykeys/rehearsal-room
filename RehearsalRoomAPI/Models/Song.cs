using System.ComponentModel.DataAnnotations;

namespace RehearsalRoomAPI.Models
{
    public class Song
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Key { get; set; } = string.Empty;

        [Required]
        public string Format { get; set; } = string.Empty;

        public string YouTubeLink { get; set; } = string.Empty;

        public string AudioFileName { get; set; } = string.Empty;
    }
}