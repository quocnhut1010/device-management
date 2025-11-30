using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformedByIdToReplacement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PerformedById",
                table: "Replacements",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Replacements_PerformedById",
                table: "Replacements",
                column: "PerformedById");

            migrationBuilder.AddForeignKey(
                name: "FK_Replacements_Users_PerformedById",
                table: "Replacements",
                column: "PerformedById",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Replacements_Users_PerformedById",
                table: "Replacements");

            migrationBuilder.DropIndex(
                name: "IX_Replacements_PerformedById",
                table: "Replacements");

            migrationBuilder.DropColumn(
                name: "PerformedById",
                table: "Replacements");
        }
    }
}
