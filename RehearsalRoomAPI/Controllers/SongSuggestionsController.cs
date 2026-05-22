using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RehearsalRoomAPI.Data;
using RehearsalRoomAPI.Models;

namespace RehearsalRoomAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SongSuggestionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SongSuggestionsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/songsuggestions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SongSuggestion>>> GetSuggestions()
        {
            return await _context.SongSuggestions
                .OrderByDescending(s => s.CreatedDate)
                .ToListAsync();
        }

        // POST: api/songsuggestions
        [HttpPost]
        public async Task<ActionResult<SongSuggestion>> CreateSuggestion(SongSuggestion suggestion)
        {
            suggestion.Status = "Pending";
            suggestion.CreatedDate = DateTime.UtcNow;

            _context.SongSuggestions.Add(suggestion);

            await _context.SaveChangesAsync();

            return Ok(suggestion);
        }

        // PUT: api/songsuggestions/5/approve
        [HttpPut("{id}/approve")]
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

        // PUT: api/songsuggestions/5/reject
        [HttpPut("{id}/reject")]
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
    }
}