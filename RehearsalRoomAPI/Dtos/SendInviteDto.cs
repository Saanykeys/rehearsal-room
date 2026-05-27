namespace RehearsalRoomAPI.Dtos
{
    public class SendInviteDto
    {
        public string Email { get; set; } = string.Empty;
        public string? Name { get; set; }
        public string InviteLink { get; set; } = string.Empty;
        public string OrgName { get; set; } = string.Empty;
    }
}
