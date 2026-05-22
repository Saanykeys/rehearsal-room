namespace RehearsalRoomAPI.Dtos
{
    public class SongResponseDto
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Key { get; set; } = string.Empty;

        public string Format { get; set; } = string.Empty;

        public string YouTubeLink { get; set; } = string.Empty;

        public string AudioFileName { get; set; } = string.Empty;
    }
}