using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RehearsalRoomAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddAudioFileToSongs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AudioFileName",
                table: "Songs",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AudioFileName",
                table: "Songs");
        }
    }
}
