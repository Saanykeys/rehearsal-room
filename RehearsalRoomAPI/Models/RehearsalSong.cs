using System;

namespace RehearsalRoomAPI.Models
{
    public class RehearsalSong
    {
        public int Id { get; set; }

        public int RehearsalEventId { get; set; }
        public RehearsalEvent? RehearsalEvent { get; set; }

        public int SongId { get; set; }
        public Song? Song { get; set; }

        public int SortOrder { get; set; }
    }
}