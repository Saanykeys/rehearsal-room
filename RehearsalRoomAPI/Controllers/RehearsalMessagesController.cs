using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RehearsalRoomAPI.Data;
using RehearsalRoomAPI.Models;
using System.Security.Claims;

namespace RehearsalRoomAPI.Controllers
{
    [ApiController]
    [Route("api/RehearsalMessages")]
    [Authorize]
    public class RehearsalMessagesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RehearsalMessagesController(AppDbContext context)
        {
            _context = context;
        }

        private int GetOrgId() =>
            int.TryParse(User.FindFirst("OrganizationId")?.Value, out var id) ? id : 0;

        private int GetUserId() =>
            int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : 0;

        private string GetUserName() =>
            User.FindFirst(ClaimTypes.Name)?.Value ?? "Team Member";

        // GET /api/RehearsalMessages/{rehearsalId}
        [HttpGet("{rehearsalId:int}")]
        public async Task<ActionResult<IEnumerable<object>>> GetMessages(int rehearsalId)
        {
            var orgId = GetOrgId();

            // Verify the rehearsal belongs to this org
            var rehearsalExists = await _context.RehearsalEvents
                .AnyAsync(r => r.Id == rehearsalId && r.OrganizationId == orgId);

            if (!rehearsalExists)
                return NotFound("Rehearsal not found.");

            var messages = await _context.RehearsalMessages
                .Where(m => m.RehearsalEventId == rehearsalId && m.OrganizationId == orgId)
                .OrderBy(m => m.CreatedAt)
                .Select(m => new
                {
                    m.Id,
                    m.AuthorId,
                    m.AuthorName,
                    m.Body,
                    m.CreatedAt,
                    isOwn = m.AuthorId == GetUserId()
                })
                .ToListAsync();

            return Ok(messages);
        }

        // POST /api/RehearsalMessages/{rehearsalId}
        [HttpPost("{rehearsalId:int}")]
        public async Task<ActionResult<object>> PostMessage(int rehearsalId, [FromBody] PostMessageDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Body))
                return BadRequest("Message body is required.");

            var orgId = GetOrgId();
            var userId = GetUserId();
            var userName = GetUserName();

            // Verify the rehearsal belongs to this org
            var rehearsalExists = await _context.RehearsalEvents
                .AnyAsync(r => r.Id == rehearsalId && r.OrganizationId == orgId);

            if (!rehearsalExists)
                return NotFound("Rehearsal not found.");

            var message = new RehearsalMessage
            {
                OrganizationId = orgId,
                RehearsalEventId = rehearsalId,
                AuthorId = userId,
                AuthorName = userName,
                Body = dto.Body.Trim(),
                CreatedAt = DateTime.UtcNow,
            };

            _context.RehearsalMessages.Add(message);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message.Id,
                message.AuthorId,
                message.AuthorName,
                message.Body,
                message.CreatedAt,
                isOwn = true
            });
        }

        // DELETE /api/RehearsalMessages/{id}
        // Directors can delete any message; members can only delete their own
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            var orgId = GetOrgId();
            var userId = GetUserId();
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "";

            var message = await _context.RehearsalMessages
                .FirstOrDefaultAsync(m => m.Id == id && m.OrganizationId == orgId);

            if (message == null)
                return NotFound();

            if (role != "Music Director" && message.AuthorId != userId)
                return Forbid();

            _context.RehearsalMessages.Remove(message);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class PostMessageDto
    {
        public string Body { get; set; } = string.Empty;
    }
}
