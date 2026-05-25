using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RehearsalRoomAPI.Data;
using RehearsalRoomAPI.Models;
using System.Security.Claims;

namespace RehearsalRoomAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PushController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public PushController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // Returns the VAPID public key so the frontend can subscribe
        [HttpGet("vapid-public-key")]
        public IActionResult GetVapidPublicKey()
        {
            var publicKey = _config["Vapid:PublicKey"];
            return Ok(new { publicKey });
        }

        // Saves or updates a push subscription for the logged-in user
        [HttpPost("subscribe")]
        public async Task<IActionResult> Subscribe([FromBody] SubscribeDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            // Remove any old subscriptions for this user+endpoint
            var existing = await _context.PushSubscriptions
                .Where(s => s.UserId == userId && s.Endpoint == dto.Endpoint)
                .ToListAsync();
            _context.PushSubscriptions.RemoveRange(existing);

            _context.PushSubscriptions.Add(new PushSubscription
            {
                UserId = userId,
                Endpoint = dto.Endpoint,
                P256dh = dto.P256dh,
                Auth = dto.Auth,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Subscribed." });
        }

        // Removes push subscription (called on logout or when user declines)
        [HttpPost("unsubscribe")]
        public async Task<IActionResult> Unsubscribe([FromBody] UnsubscribeDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var subs = await _context.PushSubscriptions
                .Where(s => s.UserId == userId && s.Endpoint == dto.Endpoint)
                .ToListAsync();
            _context.PushSubscriptions.RemoveRange(subs);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }

    public class SubscribeDto
    {
        public string Endpoint { get; set; } = string.Empty;
        public string P256dh { get; set; } = string.Empty;
        public string Auth { get; set; } = string.Empty;
    }

    public class UnsubscribeDto
    {
        public string Endpoint { get; set; } = string.Empty;
    }
}
