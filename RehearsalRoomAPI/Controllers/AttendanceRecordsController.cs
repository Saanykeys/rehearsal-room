using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RehearsalRoomAPI.Data;
using RehearsalRoomAPI.Models;
using Microsoft.AspNetCore.Authorization;

namespace RehearsalRoomAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
//[Authorize]
    public class AttendanceRecordsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AttendanceRecordsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AttendanceRecord>>> GetAttendanceRecords()
        {
            return await _context.AttendanceRecords.ToListAsync();
        }

        [HttpGet("rehearsal/{rehearsalEventId}")]
        public async Task<ActionResult<IEnumerable<AttendanceRecord>>> GetByRehearsal(int rehearsalEventId)
        {
            return await _context.AttendanceRecords
                .Where(a => a.RehearsalEventId == rehearsalEventId)
                .ToListAsync();
        }

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

        [HttpDelete("{id}")]
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