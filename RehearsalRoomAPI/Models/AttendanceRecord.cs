using System.ComponentModel.DataAnnotations.Schema;

namespace RehearsalRoomAPI.Models
{
    public class AttendanceRecord
    {
        public int Id { get; set; }

        public int RehearsalEventId { get; set; }

        [ForeignKey("RehearsalEventId")]
        public RehearsalEvent? RehearsalEvent { get; set; }

        public int ChoirMemberId { get; set; }

        [ForeignKey("ChoirMemberId")]
        public ChoirMember? ChoirMember { get; set; }

        public bool Attending { get; set; }
    }
}