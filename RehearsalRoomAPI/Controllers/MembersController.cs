using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RehearsalRoomAPI.Data;
using RehearsalRoomAPI.Models;
using System.Security.Claims;

namespace RehearsalRoomAPI.Controllers
{
    /// <summary>
    /// Members are backed by the Users table so that login and membership
    /// are always in sync. Scoped to the caller's organization.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MembersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MembersController(AppDbContext context)
        {
            _context = context;
        }

        private int GetOrgId() =>
            int.TryParse(User.FindFirst("OrganizationId")?.Value, out var id) ? id : 0;

        // Any logged-in user can view members in their org
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetMembers()
        {
            var orgId = GetOrgId();
            var users = await _context.Users
                .Where(u => u.OrganizationId == orgId)
                .OrderBy(u => u.FullName)
                .Select(u => new
                {
                    id = u.Id,
                    fullName = u.FullName,
                    email = u.Email,
                    role = u.Role,
                    createdAt = u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        // Only Music Directors can change a member's role
        [HttpPut("{id}")]
        [Authorize(Roles = "Music Director")]
        public async Task<IActionResult> UpdateMemberRole(int id, [FromBody] UpdateMemberRoleDto dto)
        {
            var orgId = GetOrgId();
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.OrganizationId == orgId);

            if (user == null) return NotFound();

            user.Role = dto.Role;
            await _context.SaveChangesAsync();

            return Ok(new { id = user.Id, fullName = user.FullName, email = user.Email, role = user.Role });
        }

        // Only Music Directors can remove a member (deletes their account)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Music Director")]
        public async Task<IActionResult> DeleteMember(int id)
        {
            var orgId = GetOrgId();
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.OrganizationId == orgId);

            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class UpdateMemberRoleDto
    {
        public string Role { get; set; } = "Team Member";
    }
}
