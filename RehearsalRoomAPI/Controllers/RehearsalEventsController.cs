using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RehearsalRoomAPI.Data;
using RehearsalRoomAPI.Models;

namespace RehearsalRoomAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RehearsalEventsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RehearsalEventsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RehearsalEvent>>> GetEvents()
        {
            var events = await _context.RehearsalEvents
                .OrderBy(e => e.EventDate)
                .ToListAsync();

            // Populate SongIds from the join table
            var allRehearsalSongs = await _context.RehearsalSongs.ToListAsync();
            foreach (var ev in events)
            {
                ev.SongIds = allRehearsalSongs
                    .Where(rs => rs.RehearsalEventId == ev.Id)
                    .OrderBy(rs => rs.SortOrder)
                    .Select(rs => rs.SongId)
                    .ToList();
            }

            return Ok(events);
        }

        [HttpPost]
        [Authorize(Roles = "Music Director")]
        public async Task<ActionResult<RehearsalEvent>> CreateEvent(RehearsalEvent rehearsalEvent)
        {
            var songIds = rehearsalEvent.SongIds ?? new List<int>();

            rehearsalEvent.CreatedAt = DateTime.UtcNow;
            _context.RehearsalEvents.Add(rehearsalEvent);
            await _context.SaveChangesAsync();

            // Save song associations
            if (songIds.Count > 0)
            {
                var rehearsalSongs = songIds.Select((id, index) => new RehearsalSong
                {
                    RehearsalEventId = rehearsalEvent.Id,
                    SongId = id,
                    SortOrder = index
                }).ToList();
                _context.RehearsalSongs.AddRange(rehearsalSongs);
                await _context.SaveChangesAsync();
            }

            // Auto-create a Pending attendance record for every registered user
            var users = await _context.Users.ToListAsync();
            var records = users.Select(u => new AttendanceRecord
            {
                RehearsalEventId = rehearsalEvent.Id,
                MemberName = u.FullName,
                Role = u.Role,
                Status = "Pending",
                RespondedAt = DateTime.UtcNow
            }).ToList();

            _context.AttendanceRecords.AddRange(records);
            await _context.SaveChangesAsync();

            rehearsalEvent.SongIds = songIds;
            return Ok(rehearsalEvent);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Music Director")]
        public async Task<IActionResult> UpdateEvent(int id, RehearsalEvent updatedEvent)
        {
            var rehearsalEvent = await _context.RehearsalEvents.FindAsync(id);
            if (rehearsalEvent == null) return NotFound();

            rehearsalEvent.Title = updatedEvent.Title;
            rehearsalEvent.EventDate = updatedEvent.EventDate;
            rehearsalEvent.EventTime = updatedEvent.EventTime;
            rehearsalEvent.Location = updatedEvent.Location;
            rehearsalEvent.Notes = updatedEvent.Notes;

            // Replace song associations
            var existing = await _context.RehearsalSongs
                .Where(rs => rs.RehearsalEventId == id)
                .ToListAsync();
            _context.RehearsalSongs.RemoveRange(existing);

            var songIds = updatedEvent.SongIds ?? new List<int>();
            if (songIds.Count > 0)
            {
                var newSongs = songIds.Select((songId, index) => new RehearsalSong
                {
                    RehearsalEventId = id,
                    SongId = songId,
                    SortOrder = index
                }).ToList();
                _context.RehearsalSongs.AddRange(newSongs);
            }

            await _context.SaveChangesAsync();

            rehearsalEvent.SongIds = songIds;
            return Ok(rehearsalEvent);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Music Director")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var rehearsalEvent = await _context.RehearsalEvents.FindAsync(id);
            if (rehearsalEvent == null) return NotFound();

            // Cascade-delete song associations and attendance records
            var rehearsalSongs = await _context.RehearsalSongs
                .Where(rs => rs.RehearsalEventId == id)
                .ToListAsync();
            _context.RehearsalSongs.RemoveRange(rehearsalSongs);

            var attendanceRecords = await _context.AttendanceRecords
                .Where(a => a.RehearsalEventId == id)
                .ToListAsync();
            _context.AttendanceRecords.RemoveRange(attendanceRecords);

            _context.RehearsalEvents.Remove(rehearsalEvent);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
