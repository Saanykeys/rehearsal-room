using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RehearsalRoomAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRehearsalEvents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "RehearsalEvents",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "RehearsalEvents",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "RehearsalEvents");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "RehearsalEvents");
        }
    }
}
