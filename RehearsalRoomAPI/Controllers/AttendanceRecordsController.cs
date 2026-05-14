using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RehearsalRoomAPI.Data;
using RehearsalRoomAPI.Models;

namespace RehearsalRoomAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttendanceRecordsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AttendanceRecordsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AttendanceRecord>>> GetAttendance()
        {
            return await _context.AttendanceRecords
                .Include(a => a.ChoirMember)
                .Include(a => a.RehearsalEvent)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<AttendanceRecord>> SaveAttendance(
            AttendanceRecord attendanceRecord)
        {
            var existingRecord = await _context.AttendanceRecords
                .FirstOrDefaultAsync(a =>
                    a.ChoirMemberId == attendanceRecord.ChoirMemberId &&
                    a.RehearsalEventId == attendanceRecord.RehearsalEventId);

            if (existingRecord != null)
            {
                existingRecord.Attending = attendanceRecord.Attending;

                await _context.SaveChangesAsync();

                return Ok(existingRecord);
            }

            _context.AttendanceRecords.Add(attendanceRecord);

            await _context.SaveChangesAsync();

            return Ok(attendanceRecord);
        }
    }
}