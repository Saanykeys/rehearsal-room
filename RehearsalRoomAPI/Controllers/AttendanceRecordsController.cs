using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RehearsalRoomAPI.Data;
using RehearsalRoomAPI.Models;

namespace RehearsalRoomAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Fixed: [Authorize] was commented out
    public class AttendanceRecordsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AttendanceRecordsController(AppDbContext context)
        {
            _context = context;
        }

        // Any logged-in user can view attendance
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AttendanceRecord>>> GetAttendanceRecords()
        {
            return await _context.AttendanceRecords.ToListAsync();
        }

        // Any logged-in user can view attendance for a specific rehearsal
        [HttpGet("rehearsal/{rehearsalEventId}")]
        public async Task<ActionResult<IEnumerable<AttendanceRecord>>> GetByRehearsal(int rehearsalEventId)
        {
            return await _context.AttendanceRecords
                .Where(a => a.RehearsalEventId == rehearsalEventId)
                .ToListAsync();
        }

        // Any logged-in user can submit their attendance
        [HttpPost]
        public async Task<ActionResult<AttendanceRecord>> CreateAttendanceRecord(AttendanceRecord record)
        {
            record.Status = string.IsNullOrWhiteSpace(record.Status)
                ? "Pending"
                : record.Status;

            record.RespondedAt = DateTime.UtcNow;

            _context.AttendanceRecords.Add(record);
            await _context.SaveChangesAsync();

            return Ok(record);
        }

        // Any logged-in user can update their own attendance status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            var record = await _context.AttendanceRecords.FindAsync(id);

            if (record == null)
            {
                return NotFound();
            }

            record.Status = status;
            record.RespondedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(record);
        }

        // Only Admins can delete attendance records
        [HttpDelete("{id}")]
        [Authorize(Roles = "Music Director")]
        public async Task<IActionResult> DeleteAttendanceRecord(int id)
        {
            var record = await _context.AttendanceRecords.FindAsync(id);

            if (record == null)
            {
                return NotFound();
            }

            _context.AttendanceRecords.Remove(record);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}