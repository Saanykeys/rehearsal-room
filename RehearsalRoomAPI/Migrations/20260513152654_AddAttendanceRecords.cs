using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RehearsalRoomAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddAttendanceRecords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AttendanceRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    RehearsalEventId = table.Column<int>(type: "INTEGER", nullable: false),
                    ChoirMemberId = table.Column<int>(type: "INTEGER", nullable: false),
                    Attending = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttendanceRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AttendanceRecords_ChoirMembers_ChoirMemberId",
                        column: x => x.ChoirMemberId,
                        principalTable: "ChoirMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AttendanceRecords_RehearsalEvents_RehearsalEventId",
                        column: x => x.RehearsalEventId,
                        principalTable: "RehearsalEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_ChoirMemberId",
                table: "AttendanceRecords",
                column: "ChoirMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_RehearsalEventId",
                table: "AttendanceRecords",
                column: "RehearsalEventId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AttendanceRecords");
        }
    }
}
