using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RehearsalRoomAPI.Data;
using RehearsalRoomAPI.Dtos;
using RehearsalRoomAPI.Models;

namespace RehearsalRoomAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SongsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SongsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IEnumerable<SongResponseDto>> Get()
        {
            var songs = await _context.Songs.ToListAsync();

            return songs.Select(ToSongResponseDto);
        }

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
                    s.Format.ToLower().Contains(query.ToLower()))
                .ToListAsync();

            return songs.Select(ToSongResponseDto);
        }

        [HttpPost]
        public async Task<ActionResult<SongResponseDto>> Create(CreateSongDto dto)
        {
            var song = new Song
            {
                Title = dto.Title,
                Key = dto.Key,
                Format = dto.Format,
                YouTubeLink = dto.YouTubeLink
            };

            _context.Songs.Add(song);
            await _context.SaveChangesAsync();

            return Ok(ToSongResponseDto(song));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<SongResponseDto>> Update(int id, UpdateSongDto dto)
        {
            var song = await _context.Songs.FindAsync(id);

            if (song == null)
            {
                return NotFound();
            }

            song.Title = dto.Title;
            song.Key = dto.Key;
            song.Format = dto.Format;
            song.YouTubeLink = dto.YouTubeLink;

            await _context.SaveChangesAsync();

            return Ok(ToSongResponseDto(song));
        }

        [HttpDelete("{id}")]
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
                Key = song.Key,
                Format = song.Format,
                YouTubeLink = song.YouTubeLink
            };
        }
    }
}