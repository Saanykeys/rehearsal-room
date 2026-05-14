using System.ComponentModel.DataAnnotations;

namespace RehearsalRoomAPI.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = "ChoirMember";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}