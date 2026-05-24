using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RehearsalRoomAPI.Data;
using RehearsalRoomAPI.Models;

namespace RehearsalRoomAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // All endpoints require a valid login
    public class MembersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MembersController(AppDbContext context)
        {
            _context = context;
        }

        // Any logged-in user can view the members list
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Member>>> GetMembers()
        {
            return await _context.Members.ToListAsync();
        }

        // Only Admins can add members
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Member>> CreateMember(Member member)
        {
            _context.Members.Add(member);
            await _context.SaveChangesAsync();
            return Ok(member);
        }

        // Only Admins can update members
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Member>> UpdateMember(int id, Member updatedMember)
        {
            var member = await _context.Members.FindAsync(id);

            if (member == null)
            {
                return NotFound();
            }

            member.FullName = updatedMember.FullName;
            member.Email = updatedMember.Email;
            member.Role = updatedMember.Role;

            await _context.SaveChangesAsync();

            return Ok(member);
        }

        // Only Admins can delete members
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteMember(int id)
        {
            var member = await _context.Members.FindAsync(id);

            if (member == null)
            {
                return NotFound();
            }

            _context.Members.Remove(member);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}