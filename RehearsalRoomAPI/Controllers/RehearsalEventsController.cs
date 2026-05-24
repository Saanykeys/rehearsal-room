using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RehearsalRoomAPI.Data;
using RehearsalRoomAPI.Models;

namespace RehearsalRoomAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // All endpoints require a valid login
    public class RehearsalEventsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RehearsalEventsController(AppDbContext context)
        {
            _context = context;
        }

        // Any logged-in user can view rehearsals
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RehearsalEvent>>> GetEvents()
        {
            return await _context.RehearsalEvents
                .OrderBy(e => e.EventDate)
                .ToListAsync();
        }

        // Only Admins can create rehearsals
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<RehearsalEvent>> CreateEvent(RehearsalEvent rehearsalEvent)
        {
            _context.RehearsalEvents.Add(rehearsalEvent);
            await _context.SaveChangesAsync();
            return Ok(rehearsalEvent);
        }

        // Only Admins can update rehearsals
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateEvent(int id, RehearsalEvent updatedEvent)
        {
            var rehearsalEvent = await _context.RehearsalEvents.FindAsync(id);

            if (rehearsalEvent == null)
            {
                return NotFound();
            }

            rehearsalEvent.Title = updatedEvent.Title;
            rehearsalEvent.EventDate = updatedEvent.EventDate;
            rehearsalEvent.Location = updatedEvent.Location;
            rehearsalEvent.Notes = updatedEvent.Notes;

            await _context.SaveChangesAsync();

            return Ok(rehearsalEvent);
        }

        // Only Admins can delete rehearsals
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var rehearsalEvent = await _context.RehearsalEvents.FindAsync(id);

            if (rehearsalEvent == null)
            {
                return NotFound();
            }

            _context.RehearsalEvents.Remove(rehearsalEvent);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}