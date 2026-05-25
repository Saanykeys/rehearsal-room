using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RehearsalRoomAPI.Data;
using RehearsalRoomAPI.Dtos;
using RehearsalRoomAPI.Models;

namespace RehearsalRoomAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Fixed: was [controller] (no api/) — now consistent with all other controllers
    [Authorize]                 // Fixed: [Authorize] was commented out, leaving all reads public
    public class SongsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SongsController(AppDbContext context)
        {
            _context = context;
        }

        // Any logged-in user can view songs
        [HttpGet]
        public async Task<IEnumerable<SongResponseDto>> Get()
        {
            var songs = await _context.Songs.ToListAsync();
            return songs.Select(ToSongResponseDto);
        }

        // Any logged-in user can search songs
        [HttpGet("search")]
        public async Task<IEnumerable<SongResponseDto>> Search([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return new List<SongResponseDto>();
            }

            var songs = await _context.Songs
                .Where(s =>
                    s.Title.ToLower().Contains(query.ToLower()) ||
                    s.Key.ToLower().Contains(query.ToLower()) ||
                    s.Category.ToLower().Contains(query.ToLower()))
                .ToListAsync();

            return songs.Select(ToSongResponseDto);
        }

        // Only Music Directors can add songs
        [HttpPost]
        [Authorize(Roles = "Music Director")]
        public async Task<ActionResult<SongResponseDto>> Create(CreateSongDto dto)
        {
            var song = new Song
            {
                Title = dto.Title,
                Artist = dto.Artist,
                Key = dto.Key,
                Tempo = dto.Tempo,
                Category = dto.Category,
                YoutubeLink = dto.YoutubeLink,
                Notes = dto.Notes
            };

            _context.Songs.Add(song);
            await _context.SaveChangesAsync();

            return Ok(ToSongResponseDto(song));
        }

        // Only Music Directors can update songs
        [HttpPut("{id}")]
        [Authorize(Roles = "Music Director")]
        public async Task<ActionResult<SongResponseDto>> Update(int id, UpdateSongDto dto)
        {
            var song = await _context.Songs.FindAsync(id);

            if (song == null)
            {
                return NotFound();
            }

            song.Title = dto.Title;
            song.Artist = dto.Artist;
            song.Key = dto.Key;
            song.Tempo = dto.Tempo;
            song.Category = dto.Category;
            song.YoutubeLink = dto.YoutubeLink;
            song.Notes = dto.Notes;

            await _context.SaveChangesAsync();

            return Ok(ToSongResponseDto(song));
        }

        // Only Music Directors can delete songs
        [HttpDelete("{id}")]
        [Authorize(Roles = "Music Director")]
        public async Task<IActionResult> Delete(int id)
        {
            var song = await _context.Songs.FindAsync(id);

            if (song == null)
            {
                return NotFound();
            }

            _context.Songs.Remove(song);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static SongResponseDto ToSongResponseDto(Song song)
        {
            return new SongResponseDto
            {
                Id = song.Id,
                Title = song.Title,
                Artist = song.Artist,
                Key = song.Key,
                Tempo = song.Tempo,
                Category = song.Category,
                YoutubeLink = song.YoutubeLink,
                Notes = song.Notes
            };
        }
    }
}