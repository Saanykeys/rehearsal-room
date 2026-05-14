using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RehearsalRoomAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToChoirMembers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "ChoirMembers",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChoirMembers_UserId",
                table: "ChoirMembers",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChoirMembers_Users_UserId",
                table: "ChoirMembers",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChoirMembers_Users_UserId",
                table: "ChoirMembers");

            migrationBuilder.DropIndex(
                name: "IX_ChoirMembers_UserId",
                table: "ChoirMembers");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "ChoirMembers");
        }
    }
}
