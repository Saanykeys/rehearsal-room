using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RehearsalRoomAPI.Data;
using RehearsalRoomAPI.Models;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace RehearsalRoomAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WaitlistController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private readonly IHttpClientFactory _httpClientFactory;

        public WaitlistController(AppDbContext context, IConfiguration config, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _config = config;
            _httpClientFactory = httpClientFactory;
        }

        public record WaitlistRequest(string Email, string FullName, string ChurchName, string Role);

        [HttpPost]
        public async Task<IActionResult> Join([FromBody] WaitlistRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest("Email is required.");

            // Check for duplicate
            var existing = await _context.WaitlistEntries
                .AnyAsync(w => w.Email.ToLower() == request.Email.ToLower());

            if (existing)
                return Conflict("You're already on the waitlist!");

            var entry = new WaitlistEntry
            {
                Email = request.Email.Trim().ToLower(),
                FullName = request.FullName.Trim(),
                ChurchName = request.ChurchName.Trim(),
                Role = request.Role.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _context.WaitlistEntries.Add(entry);
            await _context.SaveChangesAsync();

            // Send confirmation email
            _ = Task.Run(() => SendConfirmationEmailAsync(entry));

            return Ok(new { message = "You're on the list! We'll be in touch soon." });
        }

        [HttpGet]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Music Director")]
        public async Task<IActionResult> GetEntries()
        {
            var entries = await _context.WaitlistEntries
                .OrderByDescending(w => w.CreatedAt)
                .ToListAsync();
            return Ok(entries);
        }

        private async Task SendConfirmationEmailAsync(WaitlistEntry entry)
        {
            var apiKey = _config["Resend:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey)) return;

            try
            {
                var html = $@"
                    <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 32px; border-radius: 16px;'>
                        <p style='color: #fbbf24; font-size: 12px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 8px;'>Rehearsal Room</p>
                        <h1 style='font-size: 24px; font-weight: 900; margin: 0 0 16px; color: #ffffff;'>You're on the list, {entry.FullName.Split(' ')[0]}! 🎵</h1>
                        <p style='color: #94a3b8; margin: 0 0 16px;'>Thanks for signing up for Rehearsal Room. We'll notify you as soon as we're ready for {entry.ChurchName}.</p>
                        <p style='color: #94a3b8; margin: 0 0 24px;'>In the meantime, you can check out the app at <a href='https://www.rehearsalroom.org' style='color: #fbbf24;'>rehearsalroom.org</a>.</p>
                        <hr style='border: 1px solid #1e293b; margin: 24px 0;' />
                        <p style='color: #475569; font-size: 11px;'>You signed up as a {entry.Role} from {entry.ChurchName}.</p>
                    </div>";

                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

                var testEmail = _config["Resend:TestEmail"];
                var recipient = string.IsNullOrWhiteSpace(testEmail) ? entry.Email : testEmail;

                var payload = new
                {
                    from = _config["Resend:FromEmail"] ?? "Rehearsal Room <noreply@rehearsalroom.org>",
                    to = new[] { recipient },
                    subject = "You're on the Rehearsal Room waitlist! 🎵",
                    html
                };

                await client.PostAsync("https://api.resend.com/emails",
                    new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json"));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Waitlist Email] Failed: {ex.Message}");
            }
        }
    }
}
