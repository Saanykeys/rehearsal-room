using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RehearsalRoomAPI.Data;
using RehearsalRoomAPI.Dtos;
using RehearsalRoomAPI.Models;
using RehearsalRoomAPI.Models.Auth;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace RehearsalRoomAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
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
            var directorCode = _configuration["App:DirectorCode"] ?? "";
            var isDirector = !string.IsNullOrWhiteSpace(request.DirectorCode)
                             && request.DirectorCode.Trim() == directorCode;

            Organization org;

            if (isDirector)
            {
                // Director registers → create a new organization
                if (string.IsNullOrWhiteSpace(request.OrgName))
                    return BadRequest("Organization name is required when registering as a Music Director.");

                var inviteCode = GenerateInviteCode();

                // Retry on the rare collision
                while (await _context.Organizations.AnyAsync(o => o.InviteCode == inviteCode))
                    inviteCode = GenerateInviteCode();

                org = new Organization
                {
                    Name = request.OrgName.Trim(),
                    InviteCode = inviteCode,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Organizations.Add(org);
                await _context.SaveChangesAsync(); // Get the org Id
            }
            else
            {
                // Team member registers → must supply a valid invite code
                if (string.IsNullOrWhiteSpace(request.InviteCode))
                    return BadRequest("An invite code is required. Ask your Music Director for the code.");

                var foundOrg = await _context.Organizations
                    .FirstOrDefaultAsync(o => o.InviteCode == request.InviteCode.Trim().ToUpper());

                if (foundOrg == null)
                    return BadRequest("Invalid invite code. Double-check with your Music Director.");

                org = foundOrg;
            }

            // ── Create user ───────────────────────────────────────────────────
            var user = new User
            {
                FullName = request.FullName.Trim(),
                Email = request.Email.Trim().ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = isDirector ? "Music Director" : "Team Member",
                OrganizationId = org.Id
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // ── Auto-seed attendance for upcoming rehearsals in this org ──────
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

            return Ok(CreateAuthResponse(user, org, "User registered successfully"));
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

            // Load the organization for the invite code
            var org = user.OrganizationId > 0
                ? await _context.Organizations.FindAsync(user.OrganizationId)
                : null;

            return Ok(CreateAuthResponse(user, org, "Login successful"));
        }

        [HttpPut("update-name")]
        [Authorize]
        public async Task<IActionResult> UpdateName([FromBody] UpdateNameDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized("Invalid token.");

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            if (string.IsNullOrWhiteSpace(dto.FullName))
                return BadRequest("Name cannot be empty.");

            user.FullName = dto.FullName.Trim();
            await _context.SaveChangesAsync();

            return Ok(new { message = "Name updated successfully.", fullName = user.FullName });
        }

        [HttpPut("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized("Invalid token.");

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                return BadRequest("Current password is incorrect.");

            if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 8)
                return BadRequest("New password must be at least 8 characters.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password updated successfully." });
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private static string GenerateInviteCode()
        {
            // 8-character uppercase alphanumeric code (no O, 0, I, L to avoid confusion)
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
