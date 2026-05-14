using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RehearsalRoomAPI.Data;
using RehearsalRoomAPI.Models;

namespace RehearsalRoomAPI.Controllers;

[ApiController]
[Route("choirmembers")]
public class ChoirMembersController : ControllerBase
{
    private readonly AppDbContext _context;

    public ChoirMembersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IEnumerable<ChoirMember>> GetMembers()
    {
        return await _context.ChoirMembers.ToListAsync();
    }

    [HttpPost]
    public async Task<IActionResult> AddMember(ChoirMember member)
    {
        _context.ChoirMembers.Add(member);
        await _context.SaveChangesAsync();

        return Ok(member);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAttendance(int id, ChoirMember updatedMember)
    {
        var member = await _context.ChoirMembers.FindAsync(id);

        if (member == null)
            return NotFound();

        member.Attending = updatedMember.Attending;

        await _context.SaveChangesAsync();

        return Ok(member);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMember(int id)
    {
        var member = await _context.ChoirMembers.FindAsync(id);

        if (member == null)
            return NotFound();

        _context.ChoirMembers.Remove(member);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}