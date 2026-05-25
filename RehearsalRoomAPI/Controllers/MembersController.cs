using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RehearsalRoomAPI.Data;
using RehearsalRoomAPI.Models;

namespace RehearsalRoomAPI.Controllers
{
    /// <summary>
    /// Members are backed by the Users table so that login and membership
    /// are always in sync.  The add-member flow uses Auth/register so
    /// passwords are hashed and the new user can immediately log in.
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

        // Any logged-in user can view the members list
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetMembers()
        {
            var users = await _context.Users
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
            var user = await _context.Users.FindAsync(id);
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
            var user = await _context.Users.FindAsync(id);
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
