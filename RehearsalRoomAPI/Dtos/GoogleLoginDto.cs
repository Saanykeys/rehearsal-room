namespace RehearsalRoomAPI.Dtos
{
    public class GoogleLoginDto
    {
        public string Credential { get; set; } = string.Empty;
        public string? InviteCode { get; set; }
    }

    public class GoogleTokenInfo
    {
        public string? Sub { get; set; }
        public string? Email { get; set; }
        public string? Name { get; set; }
        public string? Given_name { get; set; }
        public string? Picture { get; set; }
    }
}
