using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RehearsalRoomAPI.Data;
using RehearsalRoomAPI.Models;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using WebPush;

namespace RehearsalRoomAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnnouncementsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private readonly IHttpClientFactory _httpClientFactory;

        public AnnouncementsController(AppDbContext context, IConfiguration config, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _config = config;
            _httpClientFactory = httpClientFactory;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Announcement>>> GetAnnouncements()
        {
            return await _context.Announcements
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        [HttpPost]
        [Authorize(Roles = "Music Director")]
        public async Task<ActionResult<Announcement>> CreateAnnouncement([FromBody] Announcement announcement)
        {
            var name = User.FindFirst(ClaimTypes.Name)?.Value ?? "Music Director";

            announcement.CreatedBy = name;
            announcement.CreatedAt = DateTime.UtcNow;

            if (string.IsNullOrWhiteSpace(announcement.Title))
                return BadRequest("Title is required.");

            _context.Announcements.Add(announcement);
            await _context.SaveChangesAsync();

            // Send email (awaited so errors show in terminal)
            await SendEmailsAsync(announcement);

            // Pre-fetch subscriptions before the request ends (context gets disposed after)
            var subscriptions = await _context.PushSubscriptions.ToListAsync<Models.PushSubscription>();
            _ = Task.Run(() => SendPushNotificationsAsync(announcement, subscriptions));

            return Ok(announcement);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Music Director")]
        public async Task<IActionResult> DeleteAnnouncement(int id)
        {
            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement == null) return NotFound();

            _context.Announcements.Remove(announcement);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ── Email via Resend ─────────────────────────────────────────────────
        private async Task SendEmailsAsync(Announcement announcement)
        {
            var apiKey = _config["Resend:ApiKey"];
            var fromEmail = _config["Resend:FromEmail"] ?? "Rehearsal Room <noreply@rehearsalroom.app>";

            if (string.IsNullOrWhiteSpace(apiKey) || apiKey == "REPLACE_WITH_YOUR_RESEND_API_KEY")
                return; // Resend not configured yet

            try
            {
                var users = await _context.Users.ToListAsync();
                var toEmails = users.Select(u => u.Email).Where(e => !string.IsNullOrWhiteSpace(e)).ToList();
                if (toEmails.Count == 0) return;

                var html = $@"
                    <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 32px; border-radius: 16px;'>
                        <p style='color: #fbbf24; font-size: 12px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 8px;'>Rehearsal Room</p>
                        <h1 style='font-size: 24px; font-weight: 900; margin: 0 0 8px; color: #ffffff;'>{announcement.Title}</h1>
                        {(string.IsNullOrWhiteSpace(announcement.Body) ? "" : $"<p style='color: #94a3b8; margin: 16px 0;'>{announcement.Body}</p>")}
                        <p style='color: #64748b; font-size: 12px; margin-top: 24px;'>Posted by {announcement.CreatedBy}</p>
                        <hr style='border: 1px solid #1e293b; margin: 24px 0;' />
                        <p style='color: #475569; font-size: 11px;'>You're receiving this because you're part of the worship team.</p>
                    </div>";

                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

                // NOTE: With onboarding@resend.dev, Resend only allows sending to your
                // own verified email. Add a domain at resend.com/domains to send to everyone.
                var testEmail = _config["Resend:TestEmail"];
                var recipients = string.IsNullOrWhiteSpace(testEmail) ? toEmails : new List<string> { testEmail };

                var payload = new
                {
                    from = fromEmail,
                    to = recipients,
                    subject = $"📢 {announcement.Title}",
                    html
                };

                var response = await client.PostAsync("https://api.resend.com/emails",
                    new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json"));

                var responseBody = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"[Email] {(int)response.StatusCode} | {responseBody}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Email] Failed to send: {ex.Message}");
            }
        }

        // ── Browser push via Web Push Protocol ──────────────────────────────
        private async Task SendPushNotificationsAsync(Announcement announcement, List<Models.PushSubscription> subscriptions)
        {
            var vapidPublic = _config["Vapid:PublicKey"];
            var vapidPrivate = _config["Vapid:PrivateKey"];
            var vapidSubject = _config["Vapid:Subject"] ?? "mailto:admin@rehearsalroom.app";

            if (string.IsNullOrWhiteSpace(vapidPublic) || string.IsNullOrWhiteSpace(vapidPrivate))
                return;

            try
            {
                if (subscriptions.Count == 0) return;

                var webPushClient = new WebPushClient();
                webPushClient.SetVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

                var payload = JsonSerializer.Serialize(new
                {
                    title = announcement.Title,
                    body = string.IsNullOrWhiteSpace(announcement.Body)
                        ? $"Posted by {announcement.CreatedBy}"
                        : announcement.Body,
                    icon = "/rehearsalroom-logo.png"
                });

                var deadSubs = new List<int>();

                foreach (var sub in subscriptions)
                {
                    try
                    {
                        var pushSub = new WebPush.PushSubscription(sub.Endpoint, sub.P256dh, sub.Auth);
                        await webPushClient.SendNotificationAsync(pushSub, payload);
                    }
                    catch (WebPushException ex) when (ex.StatusCode == System.Net.HttpStatusCode.Gone)
                    {
                        // Subscription expired — mark for cleanup
                        deadSubs.Add(sub.Id);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[Push] Failed for sub {sub.Id}: {ex.Message}");
                    }
                }

                // Log expired subscriptions (cleanup happens on next request)
                if (deadSubs.Count > 0)
                    Console.WriteLine($"[Push] {deadSubs.Count} expired subscription(s) — will be cleaned up on next run.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Push] Batch send failed: {ex.Message}");
            }
        }
    }
}
