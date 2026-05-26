using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RehearsalRoomAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddMultiTenancy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ── Organizations table ───────────────────────────────────────────
            migrationBuilder.CreateTable(
                name: "Organizations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false, defaultValue: ""),
                    InviteCode = table.Column<string>(type: "TEXT", nullable: false, defaultValue: ""),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Organizations", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Organizations_InviteCode",
                table: "Organizations",
                column: "InviteCode",
                unique: true);

            // ── Add OrganizationId to Users ───────────────────────────────────
            migrationBuilder.AddColumn<int>(
                name: "OrganizationId",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            // ── Add OrganizationId to Songs ───────────────────────────────────
            migrationBuilder.AddColumn<int>(
                name: "OrganizationId",
                table: "Songs",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            // ── Add OrganizationId to RehearsalEvents ────────────────────────
            migrationBuilder.AddColumn<int>(
                name: "OrganizationId",
                table: "RehearsalEvents",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            // ── Add OrganizationId to Announcements ───────────────────────────
            migrationBuilder.AddColumn<int>(
                name: "OrganizationId",
                table: "Announcements",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            // ── Add OrganizationId to AttendanceRecords ───────────────────────
            migrationBuilder.AddColumn<int>(
                name: "OrganizationId",
                table: "AttendanceRecords",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Organizations");
            migrationBuilder.DropColumn(name: "OrganizationId", table: "Users");
            migrationBuilder.DropColumn(name: "OrganizationId", table: "Songs");
            migrationBuilder.DropColumn(name: "OrganizationId", table: "RehearsalEvents");
            migrationBuilder.DropColumn(name: "OrganizationId", table: "Announcements");
            migrationBuilder.DropColumn(name: "OrganizationId", table: "AttendanceRecords");
        }
    }
}
