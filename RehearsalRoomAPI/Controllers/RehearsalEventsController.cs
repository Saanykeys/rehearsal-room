using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RehearsalRoomAPI.Data;
using RehearsalRoomAPI.Models;

namespace RehearsalRoomAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
            return await _context.RehearsalEvents
                .OrderBy(e => e.EventDate)
                .ToListAsync();
        }

        [HttpPost]
public async Task<ActionResult<RehearsalEvent>> CreateEvent(RehearsalEvent rehearsalEvent)
{
    _context.RehearsalEvents.Add(rehearsalEvent);
    await _context.SaveChangesAsync();

    return Ok(rehearsalEvent);
}

        [HttpDelete("{id}")]
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