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
    public class AttendanceRecordsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AttendanceRecordsController(AppDbContext context)
        {
            _context = context;
        }

        private int GetOrgId() =>
            int.TryParse(User.FindFirst("OrganizationId")?.Value, out var id) ? id : 0;

        // Any logged-in user can view attendance for their org
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AttendanceRecord>>> GetAttendanceRecords()
        {
            var orgId = GetOrgId();
            return await _context.AttendanceRecords
                .Where(a => a.OrganizationId == orgId)
                .ToListAsync();
        }

        // Any logged-in user can view attendance for a specific rehearsal in their org
        [HttpGet("rehearsal/{rehearsalEventId}")]
        public async Task<ActionResult<IEnumerable<AttendanceRecord>>> GetByRehearsal(int rehearsalEventId)
        {
            var orgId = GetOrgId();
            return await _context.AttendanceRecords
                .Where(a => a.RehearsalEventId == rehearsalEventId && a.OrganizationId == orgId)
                .ToListAsync();
        }

        // Any logged-in user can submit their attendance
        [HttpPost]
        public async Task<ActionResult<AttendanceRecord>> CreateAttendanceRecord(AttendanceRecord record)
        {
            record.OrganizationId = GetOrgId();
            record.Status = string.IsNullOrWhiteSpace(record.Status) ? "Pending" : record.Status;
            record.RespondedAt = DateTime.UtcNow;

            _context.AttendanceRecords.Add(record);
            await _context.SaveChangesAsync();

            return Ok(record);
        }

        // Any logged-in user can update their own attendance status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            var orgId = GetOrgId();
            var record = await _context.AttendanceRecords
                .FirstOrDefaultAsync(a => a.Id == id && a.OrganizationId == orgId);

            if (record == null)
                return NotFound();

            record.Status = status;
            record.RespondedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(record);
        }

        // Only Directors can delete attendance records
        [HttpDelete("{id}")]
        [Authorize(Roles = "Music Director")]
        public async Task<IActionResult> DeleteAttendanceRecord(int id)
        {
            var orgId = GetOrgId();
            var record = await _context.AttendanceRecords
                .FirstOrDefaultAsync(a => a.Id == id && a.OrganizationId == orgId);

            if (record == null)
                return NotFound();

            _context.AttendanceRecords.Remove(record);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
