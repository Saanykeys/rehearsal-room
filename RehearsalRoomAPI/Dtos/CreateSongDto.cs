namespace RehearsalRoomAPI.Dtos
{
    public class CreateSongDto
    {
        public string Title { get; set; } = "";

        public string Artist { get; set; } = "";

        public string Key { get; set; } = "";

        public string Tempo { get; set; } = "";

        public string Category { get; set; } = "";

        public string YoutubeLink { get; set; } = "";

        public string Notes { get; set; } = "";
    }
}