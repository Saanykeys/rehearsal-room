using Microsoft.AspNetCore.Authorization;
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

        // ── Public: Join the waitlist ─────────────────────────────────────────
        [HttpPost]
        public async Task<IActionResult> Join([FromBody] WaitlistRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest("Email is required.");

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

            _ = Task.Run(() => SendConfirmationEmailAsync(entry));

            return Ok(new { message = "You're on the list! We'll be in touch soon." });
        }

        // ── Admin: Get all waitlist entries ───────────────────────────────────
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetEntries()
        {
            // Only allow the super-admin email
            var callerEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? "";
            var adminEmail = _config["App:AdminEmail"] ?? "";
            if (!string.Equals(callerEmail, adminEmail, StringComparison.OrdinalIgnoreCase))
                return Forbid();

            var entries = await _context.WaitlistEntries
                .OrderByDescending(w => w.CreatedAt)
                .ToListAsync();
            return Ok(entries);
        }

        // ── Admin: Approve a waitlist entry ───────────────────────────────────
        [HttpPost("{id}/approve")]
        [Authorize]
        public async Task<IActionResult> Approve(int id)
        {
            var callerEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? "";
            var adminEmail = _config["App:AdminEmail"] ?? "";
            if (!string.Equals(callerEmail, adminEmail, StringComparison.OrdinalIgnoreCase))
                return Forbid();

            var entry = await _context.WaitlistEntries.FindAsync(id);
            if (entry == null) return NotFound("Waitlist entry not found.");
            if (entry.IsApproved && !entry.InviteCodeUsed)
                return BadRequest("This person has already been approved and their code is still active.");

            // Generate a fresh single-use director code
            var code = GenerateDirectorCode();
            while (await _context.WaitlistEntries.AnyAsync(w => w.DirectorInviteCode == code))
                code = GenerateDirectorCode();

            entry.IsApproved = true;
            entry.DirectorInviteCode = code;
            entry.InviteCodeExpiry = DateTime.UtcNow.AddDays(7);
            entry.InviteCodeUsed = false;
            entry.ApprovedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Email the code to the approved person
            await SendApprovalEmailAsync(entry, code);

            return Ok(new
            {
                message = $"Approved! A director code has been emailed to {entry.Email}.",
                code,
                expiry = entry.InviteCodeExpiry
            });
        }

        // ── Helper: validate a one-time director code ─────────────────────────
        /// <summary>
        /// Called by AuthController during registration to check if the supplied
        /// code is a valid, unused, non-expired waitlist approval code.
        /// Returns the matching entry or null.
        /// </summary>
        public async Task<WaitlistEntry?> FindValidDirectorCode(string code)
        {
            return await _context.WaitlistEntries
                .FirstOrDefaultAsync(w =>
                    w.DirectorInviteCode == code &&
                    w.IsApproved &&
                    !w.InviteCodeUsed &&
                    w.InviteCodeExpiry != null &&
                    w.InviteCodeExpiry > DateTime.UtcNow);
        }

        public async Task MarkCodeUsed(WaitlistEntry entry)
        {
            entry.InviteCodeUsed = true;
            await _context.SaveChangesAsync();
        }

        // ── Email helpers ─────────────────────────────────────────────────────

        private async Task SendApprovalEmailAsync(WaitlistEntry entry, string code)
        {
            var apiKey = _config["Resend:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey)) return;

            var frontendUrl = _config["App:FrontendUrl"]?.Split(',')[0].Trim()
                              ?? "https://rehearsal-room.vercel.app";
            var registerUrl = $"{frontendUrl}/?action=register";

            try
            {
                var html = $@"
                    <div style='font-family:sans-serif;max-width:520px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:16px'>
                      <p style='color:#fbbf24;font-size:11px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 12px'>Rehearsal Room</p>
                      <h1 style='font-size:24px;font-weight:900;margin:0 0 12px'>You're approved, {entry.FullName.Split(' ')[0]}!</h1>
                      <p style='color:#94a3b8;margin:0 0 20px'>Great news — your Rehearsal Room account has been approved. Use the director code below to set up your workspace for <strong style='color:#f1f5f9'>{entry.ChurchName}</strong>.</p>

                      <div style='background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px'>
                        <p style='color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px'>Your Director Code</p>
                        <p style='color:#fbbf24;font-size:32px;font-weight:900;letter-spacing:0.15em;margin:0'>{code}</p>
                        <p style='color:#475569;font-size:12px;margin:8px 0 0'>Expires in 7 days · Single use</p>
                      </div>

                      <a href='{registerUrl}' style='display:inline-block;background:#fbbf24;color:#0f172a;font-weight:900;padding:14px 28px;border-radius:12px;text-decoration:none;font-size:15px;margin-bottom:24px'>Create Your Account →</a>

                      <p style='color:#94a3b8;font-size:13px;margin:0 0 8px'>When registering, check <strong style='color:#f1f5f9'>I'm a Music Director</strong> and enter the code above. You'll create your team workspace and get a unique invite code to share with your members.</p>
                      <hr style='border:1px solid #1e293b;margin:24px 0'/>
                      <p style='color:#475569;font-size:11px;margin:0'>If you didn't request this, please ignore this email.</p>
                    </div>";

                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

                var payload = new
                {
                    from = _config["Resend:FromEmail"] ?? "Rehearsal Room <noreply@rehearsalroom.org>",
                    to = new[] { entry.Email },
                    subject = "You're approved — here's your Rehearsal Room director code",
                    html
                };

                await client.PostAsync("https://api.resend.com/emails",
                    new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json"));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Approval Email] Failed: {ex.Message}");
            }
        }

        private async Task SendConfirmationEmailAsync(WaitlistEntry entry)
        {
            var apiKey = _config["Resend:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey)) return;

            try
            {
                var html = $@"
                    <div style='font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:16px'>
                      <p style='color:#fbbf24;font-size:12px;font-weight:900;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 8px'>Rehearsal Room</p>
                      <h1 style='font-size:24px;font-weight:900;margin:0 0 16px'>You're on the list, {entry.FullName.Split(' ')[0]}!</h1>
                      <p style='color:#94a3b8;margin:0 0 16px'>Thanks for signing up for Rehearsal Room. We'll notify you as soon as we're ready for {entry.ChurchName}.</p>
                      <hr style='border:1px solid #1e293b;margin:24px 0'/>
                      <p style='color:#475569;font-size:11px'>You signed up as a {entry.Role} from {entry.ChurchName}.</p>
                    </div>";

                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

                var testEmail = _config["Resend:TestEmail"];
                var recipient = string.IsNullOrWhiteSpace(testEmail) ? entry.Email : testEmail;

                var payload = new
                {
                    from = _config["Resend:FromEmail"] ?? "Rehearsal Room <noreply@rehearsalroom.org>",
                    to = new[] { recipient },
                    subject = "You're on the Rehearsal Room waitlist!",
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

        private static string GenerateDirectorCode()
        {
            const string chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
            var random = new Random();
            return new string(Enumerable.Range(0, 10).Select(_ => chars[random.Next(chars.Length)]).ToArray());
        }
    }
}
