using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RehearsalRoomAPI.Data;
using RehearsalRoomAPI.Dtos;
using RehearsalRoomAPI.Models;
using System.Security.Claims;

namespace RehearsalRoomAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SongsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SongsController(AppDbContext context)
        {
            _context = context;
        }

        private int GetOrgId() =>
            int.TryParse(User.FindFirst("OrganizationId")?.Value, out var id) ? id : 0;

        // Any logged-in user can view songs in their org
        [HttpGet]
        public async Task<IEnumerable<SongResponseDto>> Get()
        {
            var orgId = GetOrgId();
            var songs = await _context.Songs
                .Where(s => s.OrganizationId == orgId)
                .ToListAsync();
            return songs.Select(ToSongResponseDto);
        }

        // Any logged-in user can search songs in their org
        [HttpGet("search")]
        public async Task<IEnumerable<SongResponseDto>> Search([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return new List<SongResponseDto>();

            var orgId = GetOrgId();
            var songs = await _context.Songs
                .Where(s => s.OrganizationId == orgId &&
                    (s.Title.ToLower().Contains(query.ToLower()) ||
                     s.Key.ToLower().Contains(query.ToLower()) ||
                     s.Category.ToLower().Contains(query.ToLower())))
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
                OrganizationId = GetOrgId(),
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
            var orgId = GetOrgId();
            var song = await _context.Songs
                .FirstOrDefaultAsync(s => s.Id == id && s.OrganizationId == orgId);

            if (song == null)
                return NotFound();

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
            var orgId = GetOrgId();
            var song = await _context.Songs
                .FirstOrDefaultAsync(s => s.Id == id && s.OrganizationId == orgId);

            if (song == null)
                return NotFound();

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
