using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RehearsalRoomAPI.Data;
using RehearsalRoomAPI.Dtos;
using RehearsalRoomAPI.Models;
using RehearsalRoomAPI.Models.Auth;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace RehearsalRoomAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;

        public AuthController(AppDbContext context, IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            // ── Basic validation ──────────────────────────────────────────────
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email.Trim().ToLower());

            if (existingUser != null)
                return BadRequest("An account with this email already exists.");

            if (string.IsNullOrWhiteSpace(request.FullName))
                return BadRequest("Full name is required.");

            if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
                return BadRequest("Password must be at least 8 characters.");

            // ── Determine role and organization ───────────────────────────────
            var superAdminCode = _configuration["App:DirectorCode"] ?? "";
            var submittedCode = request.DirectorCode?.Trim() ?? "";

            // Check hardcoded super-admin code first, then one-time waitlist codes
            bool isDirector = false;
            WaitlistEntry? approvedWaitlistEntry = null;

            if (!string.IsNullOrWhiteSpace(submittedCode))
            {
                if (submittedCode == superAdminCode)
                {
                    isDirector = true;
                }
                else
                {
                    // Check the waitlist table for a valid one-time code
                    approvedWaitlistEntry = await _context.WaitlistEntries
                        .FirstOrDefaultAsync(w =>
                            w.DirectorInviteCode == submittedCode &&
                            w.IsApproved &&
                            !w.InviteCodeUsed &&
                            w.InviteCodeExpiry != null &&
                            w.InviteCodeExpiry > DateTime.UtcNow);

                    if (approvedWaitlistEntry != null)
                        isDirector = true;
                }
            }

            if (!string.IsNullOrWhiteSpace(submittedCode) && !isDirector)
                return BadRequest("Invalid or expired director code.");

            Organization org;

            if (isDirector)
            {
                if (string.IsNullOrWhiteSpace(request.OrgName))
                    return BadRequest("Organization name is required when registering as a Music Director.");

                var inviteCode = GenerateInviteCode();
                while (await _context.Organizations.AnyAsync(o => o.InviteCode == inviteCode))
                    inviteCode = GenerateInviteCode();

                org = new Organization
                {
                    Name = request.OrgName.Trim(),
                    InviteCode = inviteCode,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Organizations.Add(org);
                await _context.SaveChangesAsync();
            }
            else
            {
                if (string.IsNullOrWhiteSpace(request.InviteCode))
                    return BadRequest("An invite code is required. Ask your Music Director for the code.");

                var foundOrg = await _context.Organizations
                    .FirstOrDefaultAsync(o => o.InviteCode == request.InviteCode.Trim().ToUpper());

                if (foundOrg == null)
                    return BadRequest("Invalid invite code. Double-check with your Music Director.");

                org = foundOrg;
            }

            // ── Create user (unverified) ──────────────────────────────────────
            var verificationToken = Guid.NewGuid().ToString("N"); // 32-char hex

            var user = new User
            {
                FullName = request.FullName.Trim(),
                Email = request.Email.Trim().ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = isDirector ? "Music Director" : "Team Member",
                OrganizationId = org.Id,
                IsEmailVerified = false,
                EmailVerificationToken = verificationToken
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // ── Mark one-time director code as used ───────────────────────────
            if (approvedWaitlistEntry != null)
            {
                approvedWaitlistEntry.InviteCodeUsed = true;
                await _context.SaveChangesAsync();
            }

            // ── Auto-seed attendance ──────────────────────────────────────────
            var upcomingRehearsals = await _context.RehearsalEvents
                .Where(e => e.OrganizationId == org.Id && e.EventDate >= DateTime.UtcNow.Date)
                .ToListAsync();

            if (upcomingRehearsals.Count > 0)
            {
                var attendanceRecords = upcomingRehearsals.Select(r => new AttendanceRecord
                {
                    OrganizationId = org.Id,
                    RehearsalEventId = r.Id,
                    MemberName = user.FullName,
                    Role = user.Role,
                    Status = "Pending",
                    RespondedAt = DateTime.UtcNow
                }).ToList();

                _context.AttendanceRecords.AddRange(attendanceRecords);
                await _context.SaveChangesAsync();
            }

            // ── Send verification email ───────────────────────────────────────
            var frontendUrl = _configuration["App:FrontendUrl"]?.Split(',')[0].Trim()
                              ?? "https://rehearsal-room.vercel.app";
            var verifyLink = $"{frontendUrl}/verify-email?token={verificationToken}";

            await SendVerificationEmailAsync(user.Email, user.FullName, verifyLink);

            // Return without a token — user must verify first
            return Ok(new
            {
                message = "Registration successful! Please check your email to verify your account.",
                requiresVerification = true,
                email = user.Email
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email.Trim().ToLower());

            if (user == null)
                return Unauthorized("Invalid email or password.");

            var passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

            if (!passwordValid)
                return Unauthorized("Invalid email or password.");

            // ── Block unverified accounts ─────────────────────────────────────
            if (!user.IsEmailVerified)
                return StatusCode(403, "Please verify your email before logging in. Check your inbox for the verification link.");

            var org = user.OrganizationId > 0
                ? await _context.Organizations.FindAsync(user.OrganizationId)
                : null;

            return Ok(CreateAuthResponse(user, org, "Login successful"));
        }

        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return BadRequest("Invalid verification token.");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.EmailVerificationToken == token);

            if (user == null)
                return BadRequest("This verification link is invalid or has already been used.");

            user.IsEmailVerified = true;
            user.EmailVerificationToken = null;
            await _context.SaveChangesAsync();

            var org = user.OrganizationId > 0
                ? await _context.Organizations.FindAsync(user.OrganizationId)
                : null;

            return Ok(new
            {
                message = "Email verified successfully! You can now log in.",
                verified = true
            });
        }

        [HttpPost("resend-verification")]
        public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest("Email is required.");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email.Trim().ToLower());

            // Always return OK to avoid email enumeration attacks
            if (user == null || user.IsEmailVerified)
                return Ok(new { message = "If that email exists and is unverified, a new link has been sent." });

            // Generate a fresh token
            user.EmailVerificationToken = Guid.NewGuid().ToString("N");
            await _context.SaveChangesAsync();

            var frontendUrl = _configuration["App:FrontendUrl"]?.Split(',')[0].Trim()
                              ?? "https://rehearsal-room.vercel.app";
            var verifyLink = $"{frontendUrl}/verify-email?token={user.EmailVerificationToken}";

            await SendVerificationEmailAsync(user.Email, user.FullName, verifyLink);

            return Ok(new { message = "If that email exists and is unverified, a new link has been sent." });
        }

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Credential))
                return BadRequest("Google credential is required.");

            // ── Validate the Google ID token ──────────────────────────────────
            GoogleTokenInfo? tokenInfo = null;
            try
            {
                var client = _httpClientFactory.CreateClient();
                var response = await client.GetAsync(
                    $"https://oauth2.googleapis.com/tokeninfo?id_token={dto.Credential}");

                if (!response.IsSuccessStatusCode)
                    return Unauthorized("Invalid Google token.");

                var json = await response.Content.ReadAsStringAsync();
                tokenInfo = System.Text.Json.JsonSerializer.Deserialize<GoogleTokenInfo>(json,
                    new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            catch
            {
                return Unauthorized("Could not validate Google token.");
            }

            if (tokenInfo == null || string.IsNullOrWhiteSpace(tokenInfo.Sub))
                return Unauthorized("Invalid Google token.");

            var googleEmail = tokenInfo.Email?.Trim().ToLower() ?? "";
            var googleName = tokenInfo.Name ?? googleEmail;
            var googleId = tokenInfo.Sub;

            // ── Check if user already exists ──────────────────────────────────
            var existingUser = await _context.Users.FirstOrDefaultAsync(u =>
                u.GoogleId == googleId || u.Email == googleEmail);

            if (existingUser != null)
            {
                // Link Google ID if not already linked
                if (string.IsNullOrWhiteSpace(existingUser.GoogleId))
                {
                    existingUser.GoogleId = googleId;
                    await _context.SaveChangesAsync();
                }

                if (!existingUser.IsEmailVerified)
                {
                    existingUser.IsEmailVerified = true;
                    await _context.SaveChangesAsync();
                }

                var org = existingUser.OrganizationId > 0
                    ? await _context.Organizations.FindAsync(existingUser.OrganizationId)
                    : null;

                return Ok(CreateAuthResponse(existingUser, org, "Login successful"));
            }

            // ── New user — needs an invite code to join a team ────────────────
            if (string.IsNullOrWhiteSpace(dto.InviteCode))
            {
                return Ok(new
                {
                    requiresInviteCode = true,
                    googleId,
                    email = googleEmail,
                    fullName = googleName
                });
            }

            // Find the org by invite code
            var foundOrg = await _context.Organizations
                .FirstOrDefaultAsync(o => o.InviteCode == dto.InviteCode.Trim().ToUpper());

            if (foundOrg == null)
                return BadRequest("Invalid invite code. Double-check with your Music Director.");

            // Create the new user — already verified via Google
            var newUser = new User
            {
                FullName = googleName,
                Email = googleEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()), // random unusable password
                Role = "Team Member",
                OrganizationId = foundOrg.Id,
                GoogleId = googleId,
                IsEmailVerified = true
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            // Auto-seed attendance
            var upcomingRehearsals = await _context.RehearsalEvents
                .Where(e => e.OrganizationId == foundOrg.Id && e.EventDate >= DateTime.UtcNow.Date)
                .ToListAsync();

            if (upcomingRehearsals.Count > 0)
            {
                _context.AttendanceRecords.AddRange(upcomingRehearsals.Select(r => new AttendanceRecord
                {
                    OrganizationId = foundOrg.Id,
                    RehearsalEventId = r.Id,
                    MemberName = newUser.FullName,
                    Role = newUser.Role,
                    Status = "Pending",
                    RespondedAt = DateTime.UtcNow
                }));
                await _context.SaveChangesAsync();
            }

            return Ok(CreateAuthResponse(newUser, foundOrg, "Account created successfully"));
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest("Email is required.");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email.Trim().ToLower());

            // Always return OK — never reveal whether the email exists
            if (user == null)
                return Ok(new { message = "If that email is registered, a reset link has been sent." });

            // Generate a secure token valid for 1 hour
            user.PasswordResetToken = Guid.NewGuid().ToString("N");
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
            await _context.SaveChangesAsync();

            var frontendUrl = _configuration["App:FrontendUrl"]?.Split(',')[0].Trim()
                              ?? "https://rehearsal-room.vercel.app";
            var resetLink = $"{frontendUrl}/reset-password?token={user.PasswordResetToken}";

            await SendPasswordResetEmailAsync(user.Email, user.FullName, resetLink);

            return Ok(new { message = "If that email is registered, a reset link has been sent." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Token))
                return BadRequest("Invalid reset token.");

            if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 8)
                return BadRequest("Password must be at least 8 characters.");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.PasswordResetToken == dto.Token);

            if (user == null)
                return BadRequest("This reset link is invalid or has already been used.");

            if (user.PasswordResetTokenExpiry == null || user.PasswordResetTokenExpiry < DateTime.UtcNow)
                return BadRequest("This reset link has expired. Please request a new one.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password reset successfully. You can now log in with your new password." });
        }

        [HttpPut("update-name")]
        [Authorize]
        public async Task<IActionResult> UpdateName([FromBody] UpdateNameDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized("Invalid token.");

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found.");

            if (string.IsNullOrWhiteSpace(dto.FullName))
                return BadRequest("Name cannot be empty.");

            user.FullName = dto.FullName.Trim();
            await _context.SaveChangesAsync();

            return Ok(new { message = "Name updated successfully.", fullName = user.FullName });
        }

        [HttpPost("send-invite")]
        [Authorize(Roles = "Music Director")]
        public async Task<IActionResult> SendInvite([FromBody] SendInviteDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest("Email is required.");

            var directorName = User.FindFirst(ClaimTypes.Name)?.Value ?? "Your Music Director";
            var greeting = string.IsNullOrWhiteSpace(dto.Name) ? "Hey there" : $"Hey {dto.Name.Trim()}";

            try
            {
                var resendApiKey = _configuration["Resend:ApiKey"] ?? "";
                if (string.IsNullOrWhiteSpace(resendApiKey))
                    return Ok(new { message = "Invite link generated (email not configured)." });

                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", resendApiKey);

                var html = $@"
                    <div style='font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f172a;color:#f1f5f9;border-radius:16px;'>
                      <h1 style='color:#fbbf24;font-size:24px;margin:0 0 8px;'>You're invited! 🎵</h1>
                      <p style='color:#94a3b8;margin:0 0 24px;'>{greeting}, {directorName} has invited you to join <strong style='color:#f1f5f9;'>{dto.OrgName}</strong> on Rehearsal Room.</p>
                      <a href='{dto.InviteLink}' style='display:inline-block;background:#fbbf24;color:#0f172a;font-weight:900;padding:14px 28px;border-radius:12px;text-decoration:none;font-size:16px;'>
                        Join {dto.OrgName} →
                      </a>
                      <p style='color:#475569;font-size:13px;margin-top:24px;'>Just click the button, create your account, and you're in. The invite code is already filled in for you.</p>
                      <p style='color:#334155;font-size:12px;margin-top:16px;'>Rehearsal Room · Worship team management</p>
                    </div>";

                var payload = new
                {
                    from = "Rehearsal Room <noreply@rehearsalroom.app>",
                    to = new[] { dto.Email.Trim() },
                    subject = $"You're invited to join {dto.OrgName} on Rehearsal Room",
                    html
                };

                var response = await client.PostAsJsonAsync("https://api.resend.com/emails", payload);
                if (!response.IsSuccessStatusCode)
                    return StatusCode(500, "Could not send invite email.");
            }
            catch
            {
                return StatusCode(500, "Could not send invite email.");
            }

            return Ok(new { message = "Invite sent!" });
        }

        [HttpPut("update-org-name")]
        [Authorize(Roles = "Music Director")]
        public async Task<IActionResult> UpdateOrgName([FromBody] UpdateOrgNameDto dto)
        {
            var orgIdClaim = User.FindFirst("OrganizationId")?.Value;
            if (orgIdClaim == null || !int.TryParse(orgIdClaim, out var orgId) || orgId == 0)
                return Unauthorized("Invalid token.");

            if (string.IsNullOrWhiteSpace(dto.OrgName))
                return BadRequest("Organization name cannot be empty.");

            var org = await _context.Organizations.FindAsync(orgId);
            if (org == null) return NotFound("Organization not found.");

            org.Name = dto.OrgName.Trim();
            await _context.SaveChangesAsync();

            return Ok(new { message = "Organization name updated.", orgName = org.Name });
        }

        [HttpPut("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized("Invalid token.");

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found.");

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                return BadRequest("Current password is incorrect.");

            if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 8)
                return BadRequest("New password must be at least 8 characters.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password updated successfully." });
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private async Task SendVerificationEmailAsync(string toEmail, string toName, string verifyLink)
        {
            try
            {
                var resendApiKey = _configuration["Resend:ApiKey"] ?? "";
                if (string.IsNullOrWhiteSpace(resendApiKey)) return;

                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", resendApiKey);

                var payload = new
                {
                    from = "Rehearsal Room <noreply@rehearsalroom.app>",
                    to = new[] { toEmail },
                    subject = "Verify your Rehearsal Room account",
                    html = $@"
                        <div style=""font-family:sans-serif;max-width:480px;margin:0 auto;background:#0f172a;color:#f8fafc;padding:32px;border-radius:16px"">
                          <p style=""font-size:11px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;color:#fbbf24;margin:0 0 16px"">Rehearsal Room</p>
                          <h1 style=""font-size:24px;font-weight:900;margin:0 0 12px"">Verify your email</h1>
                          <p style=""color:#94a3b8;margin:0 0 24px"">Hi {toName}, thanks for signing up! Click the button below to verify your email address and activate your account.</p>
                          <a href=""{verifyLink}"" style=""display:inline-block;background:#fbbf24;color:#0f172a;font-weight:900;padding:14px 28px;border-radius:12px;text-decoration:none;font-size:15px"">Verify Email Address</a>
                          <p style=""color:#475569;font-size:12px;margin:24px 0 0"">If you didn't create this account, you can safely ignore this email. This link expires in 24 hours.</p>
                          <p style=""color:#475569;font-size:12px;margin:8px 0 0"">Or copy this link: <a href=""{verifyLink}"" style=""color:#fbbf24"">{verifyLink}</a></p>
                        </div>"
                };

                var json = JsonSerializer.Serialize(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                await client.PostAsync("https://api.resend.com/emails", content);
            }
            catch
            {
                // Email failure should not block registration
            }
        }

        private async Task SendPasswordResetEmailAsync(string toEmail, string toName, string resetLink)
        {
            try
            {
                var resendApiKey = _configuration["Resend:ApiKey"] ?? "";
                if (string.IsNullOrWhiteSpace(resendApiKey)) return;

                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", resendApiKey);

                var payload = new
                {
                    from = "Rehearsal Room <noreply@rehearsalroom.app>",
                    to = new[] { toEmail },
                    subject = "Reset your Rehearsal Room password",
                    html = $@"
                        <div style=""font-family:sans-serif;max-width:480px;margin:0 auto;background:#0f172a;color:#f8fafc;padding:32px;border-radius:16px"">
                          <p style=""font-size:11px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;color:#fbbf24;margin:0 0 16px"">Rehearsal Room</p>
                          <h1 style=""font-size:24px;font-weight:900;margin:0 0 12px"">Reset your password</h1>
                          <p style=""color:#94a3b8;margin:0 0 24px"">Hi {toName}, we received a request to reset your password. Click the button below to choose a new one.</p>
                          <a href=""{resetLink}"" style=""display:inline-block;background:#fbbf24;color:#0f172a;font-weight:900;padding:14px 28px;border-radius:12px;text-decoration:none;font-size:15px"">Reset Password</a>
                          <p style=""color:#475569;font-size:12px;margin:24px 0 0"">This link expires in <strong style=""color:#94a3b8"">1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password will not change.</p>
                          <p style=""color:#475569;font-size:12px;margin:8px 0 0"">Or copy this link: <a href=""{resetLink}"" style=""color:#fbbf24"">{resetLink}</a></p>
                        </div>"
                };

                var json = JsonSerializer.Serialize(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                await client.PostAsync("https://api.resend.com/emails", content);
            }
            catch
            {
                // Email failure should not surface as an error
            }
        }

        private static string GenerateInviteCode()
        {
            const string chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
            var random = new Random();
            return new string(Enumerable.Range(0, 8).Select(_ => chars[random.Next(chars.Length)]).ToArray());
        }

        private object CreateAuthResponse(User user, Organization? org, string message)
        {
            return new
            {
                message,
                id = user.Id,
                fullName = user.FullName,
                email = user.Email,
                role = user.Role,
                organizationId = user.OrganizationId,
                orgName = org?.Name ?? "",
                inviteCode = user.Role == "Music Director" ? org?.InviteCode ?? "" : "",
                token = CreateToken(user, org)
            };
        }

        private string CreateToken(User user, Organization? org)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("OrganizationId", user.OrganizationId.ToString())
            };

            var jwtKey = _configuration["Jwt:Key"];
            if (string.IsNullOrWhiteSpace(jwtKey))
                throw new Exception("JWT Key is missing from appsettings.json.");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
