using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using RehearsalRoomAPI.Models;

namespace RehearsalRoomAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.ConfigureWarnings(w =>
                w.Ignore(RelationalEventId.PendingModelChangesWarning));
        }

        public DbSet<Organization> Organizations { get; set; }

        public DbSet<Song> Songs { get; set; }

        public DbSet<SongSuggestion> SongSuggestions { get; set; }

        public DbSet<RehearsalSong> RehearsalSongs { get; set; }

        public DbSet<ChoirMember> ChoirMembers { get; set; }

        public DbSet<User> Users { get; set; }

        public DbSet<RehearsalEvent> RehearsalEvents { get; set; }

        public DbSet<AttendanceRecord> AttendanceRecords { get; set; }

        public DbSet<Announcement> Announcements { get; set; }

        public DbSet<PushSubscription> PushSubscriptions { get; set; }

        public DbSet<WaitlistEntry> WaitlistEntries { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Unique invite code per organization
            modelBuilder.Entity<Organization>()
                .HasIndex(o => o.InviteCode)
                .IsUnique();
        }
    }
}
