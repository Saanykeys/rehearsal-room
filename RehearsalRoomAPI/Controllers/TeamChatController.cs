using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RehearsalRoomAPI.Data;
using RehearsalRoomAPI.Models;
using System.Security.Claims;

namespace RehearsalRoomAPI.Controllers
{
    [ApiController]
    [Route("api/TeamChat")]
    [Authorize]
    public class TeamChatController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TeamChatController(AppDbContext context)
        {
            _context = context;
        }

        private int GetOrgId() =>
            int.TryParse(User.FindFirst("OrganizationId")?.Value, out var id) ? id : 0;

        private int GetUserId() =>
            int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : 0;

        private string GetUserName() =>
            User.FindFirst(ClaimTypes.Name)?.Value ?? "Team Member";

        // GET /api/TeamChat?since=<id>  — returns last 100 messages, or only newer than `since`
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetMessages([FromQuery] int since = 0)
        {
            var orgId = GetOrgId();
            var userId = GetUserId();

            var query = _context.TeamChatMessages
                .Where(m => m.OrganizationId == orgId);

            if (since > 0)
                query = query.Where(m => m.Id > since);

            var raw = await query
                .OrderBy(m => m.CreatedAt)
                .Take(100)
                .ToListAsync();

            var result = raw.Select(m => new
            {
                m.Id,
                m.AuthorId,
                m.AuthorName,
                m.Body,
                m.CreatedAt,
                isOwn = m.AuthorId == userId
            });

            return Ok(result);
        }

        // POST /api/TeamChat
        [HttpPost]
        public async Task<ActionResult<object>> PostMessage([FromBody] TeamChatDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Body))
                return BadRequest("Message cannot be empty.");

            var orgId = GetOrgId();
            var userId = GetUserId();
            var userName = GetUserName();

            var message = new TeamChatMessage
            {
                OrganizationId = orgId,
                AuthorId = userId,
                AuthorName = userName,
                Body = dto.Body.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _context.TeamChatMessages.Add(message);
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

        // DELETE /api/TeamChat/{id} — directors can delete any, members only their own
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            var orgId = GetOrgId();
            var userId = GetUserId();
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "";

            var message = await _context.TeamChatMessages
                .FirstOrDefaultAsync(m => m.Id == id && m.OrganizationId == orgId);

            if (message == null) return NotFound();

            if (role != "Music Director" && message.AuthorId != userId)
                return Forbid();

            _context.TeamChatMessages.Remove(message);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class TeamChatDto
    {
        public string Body { get; set; } = string.Empty;
    }
}
