using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RehearsalRoomAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSongModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "YouTubeLink",
                table: "Songs",
                newName: "YoutubeLink");

            migrationBuilder.RenameColumn(
                name: "Format",
                table: "Songs",
                newName: "Tempo");

            migrationBuilder.RenameColumn(
                name: "AudioFileName",
                table: "Songs",
                newName: "Notes");

            migrationBuilder.AddColumn<string>(
                name: "Artist",
                table: "Songs",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Songs",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Songs",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Artist",
                table: "Songs");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "Songs");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Songs");

            migrationBuilder.RenameColumn(
                name: "YoutubeLink",
                table: "Songs",
                newName: "YouTubeLink");

            migrationBuilder.RenameColumn(
                name: "Tempo",
                table: "Songs",
                newName: "Format");

            migrationBuilder.RenameColumn(
                name: "Notes",
                table: "Songs",
                newName: "AudioFileName");
        }
    }
}
