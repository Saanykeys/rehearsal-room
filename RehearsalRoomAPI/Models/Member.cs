namespace RehearsalRoomAPI.Models
{
    public class Member
    {
        public int Id { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Role { get; set; } = "Choir Member";
    }
}