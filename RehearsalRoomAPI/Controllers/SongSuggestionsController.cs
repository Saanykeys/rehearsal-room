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
    public class SongSuggestionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SongSuggestionsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SongSuggestion>>> GetSuggestions()
        {
            return await _context.SongSuggestions
                .OrderByDescending(s => s.CreatedDate)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<SongSuggestion>> CreateSuggestion(SongSuggestion suggestion)
        {
            suggestion.Status = "Pending";
            suggestion.CreatedDate = DateTime.UtcNow;

            _context.SongSuggestions.Add(suggestion);
            await _context.SaveChangesAsync();

            return Ok(suggestion);
        }

        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Music Director")]
        public async Task<IActionResult> ApproveSuggestion(int id)
        {
            var suggestion = await _context.SongSuggestions.FindAsync(id);

            if (suggestion == null)
            {
                return NotFound();
            }

            suggestion.Status = "Approved";
            await _context.SaveChangesAsync();

            return Ok(suggestion);
        }

        [HttpPut("{id}/reject")]
        [Authorize(Roles = "Music Director")]
        public async Task<IActionResult> RejectSuggestion(int id)
        {
            var suggestion = await _context.SongSuggestions.FindAsync(id);

            if (suggestion == null)
            {
                return NotFound();
            }

            suggestion.Status = "Rejected";
            await _context.SaveChangesAsync();

            return Ok(suggestion);
        }

        [HttpPost("{id}/add-to-library")]
        [Authorize(Roles = "Music Director")]
        public async Task<IActionResult> AddSuggestionToLibrary(int id)
        {
            var suggestion = await _context.SongSuggestions.FindAsync(id);

            if (suggestion == null)
            {
                return NotFound();
            }

            if (suggestion.Status != "Approved")
            {
                return BadRequest("Only approved suggestions can be added to the song library.");
            }

            var song = new Song
            {
                Title = suggestion.Title,
                YoutubeLink = suggestion.YouTubeLink,
                Key = "",
                Category = "Worship"
            };

            _context.Songs.Add(song);
            await _context.SaveChangesAsync();

            return Ok(song);
        }
    }
}