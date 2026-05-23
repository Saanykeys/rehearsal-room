using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RehearsalRoomAPI.Data;
using RehearsalRoomAPI.Models;

namespace RehearsalRoomAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RehearsalSongsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RehearsalSongsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{rehearsalEventId}")]
        public async Task<IActionResult> GetSongsForRehearsal(int rehearsalEventId)
        {
            var songs = await _context.RehearsalSongs
                .Where(rs => rs.RehearsalEventId == rehearsalEventId)
                .Include(rs => rs.Song)
                .OrderBy(rs => rs.SortOrder)
                .ToListAsync();

            return Ok(songs);
        }

        [HttpPost]
        public async Task<IActionResult> AddSongToRehearsal(RehearsalSong rehearsalSong)
        {
            _context.RehearsalSongs.Add(rehearsalSong);
            await _context.SaveChangesAsync();

            return Ok(rehearsalSong);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveSongFromRehearsal(int id)
        {
            var rehearsalSong = await _context.RehearsalSongs.FindAsync(id);

            if (rehearsalSong == null)
            {
                return NotFound();
            }

            _context.RehearsalSongs.Remove(rehearsalSong);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}