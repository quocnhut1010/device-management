using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCostEstimationToRepair : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CostApprovedAt",
                table: "Repairs",
                type: "datetime",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CostApprovedBy",
                table: "Repairs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "EstimatedCost",
                table: "Repairs",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Repairs_CostApprovedBy",
                table: "Repairs",
                column: "CostApprovedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_Repairs_Users_CostApprovedBy",
                table: "Repairs",
                column: "CostApprovedBy",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Repairs_Users_CostApprovedBy",
                table: "Repairs");

            migrationBuilder.DropIndex(
                name: "IX_Repairs_CostApprovedBy",
                table: "Repairs");

            migrationBuilder.DropColumn(
                name: "CostApprovedAt",
                table: "Repairs");

            migrationBuilder.DropColumn(
                name: "CostApprovedBy",
                table: "Repairs");

            migrationBuilder.DropColumn(
                name: "EstimatedCost",
                table: "Repairs");
        }
    }
}
