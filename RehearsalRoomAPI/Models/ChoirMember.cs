using System.ComponentModel.DataAnnotations.Schema;

namespace RehearsalRoomAPI.Models
{
    public class ChoirMember
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public bool Attending { get; set; }

        public int? UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}