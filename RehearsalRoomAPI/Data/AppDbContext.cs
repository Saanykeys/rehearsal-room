using Microsoft.EntityFrameworkCore;
using RehearsalRoomAPI.Models;

namespace RehearsalRoomAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Song> Songs { get; set; }
       public DbSet<SongSuggestion> SongSuggestions { get; set; }
public DbSet<RehearsalSong> RehearsalSongs { get; set; }

        public DbSet<ChoirMember> ChoirMembers { get; set; }

        public DbSet<User> Users { get; set; }

        public DbSet<RehearsalEvent> RehearsalEvents { get; set; }

        public DbSet<AttendanceRecord> AttendanceRecords { get; set; }
    }
}