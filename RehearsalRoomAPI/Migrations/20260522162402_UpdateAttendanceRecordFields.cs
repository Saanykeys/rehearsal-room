using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RehearsalRoomAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAttendanceRecordFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AttendanceRecords_ChoirMembers_ChoirMemberId",
                table: "AttendanceRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_AttendanceRecords_RehearsalEvents_RehearsalEventId",
                table: "AttendanceRecords");

            migrationBuilder.DropIndex(
                name: "IX_AttendanceRecords_ChoirMemberId",
                table: "AttendanceRecords");

            migrationBuilder.DropIndex(
                name: "IX_AttendanceRecords_RehearsalEventId",
                table: "AttendanceRecords");

            migrationBuilder.DropColumn(
                name: "Attending",
                table: "AttendanceRecords");

            migrationBuilder.DropColumn(
                name: "ChoirMemberId",
                table: "AttendanceRecords");

            migrationBuilder.AddColumn<string>(
                name: "MemberName",
                table: "AttendanceRecords",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "RespondedAt",
                table: "AttendanceRecords",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "AttendanceRecords",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "AttendanceRecords",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MemberName",
                table: "AttendanceRecords");

            migrationBuilder.DropColumn(
                name: "RespondedAt",
                table: "AttendanceRecords");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "AttendanceRecords");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "AttendanceRecords");

            migrationBuilder.AddColumn<bool>(
                name: "Attending",
                table: "AttendanceRecords",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ChoirMemberId",
                table: "AttendanceRecords",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_ChoirMemberId",
                table: "AttendanceRecords",
                column: "ChoirMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_RehearsalEventId",
                table: "AttendanceRecords",
                column: "RehearsalEventId");

            migrationBuilder.AddForeignKey(
                name: "FK_AttendanceRecords_ChoirMembers_ChoirMemberId",
                table: "AttendanceRecords",
                column: "ChoirMemberId",
                principalTable: "ChoirMembers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AttendanceRecords_RehearsalEvents_RehearsalEventId",
                table: "AttendanceRecords",
                column: "RehearsalEventId",
                principalTable: "RehearsalEvents",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
