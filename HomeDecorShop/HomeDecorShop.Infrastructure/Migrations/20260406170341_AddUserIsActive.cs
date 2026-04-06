using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeDecorShop.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIsActive : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: true); // Set default to true for existing users
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CartItems");

            migrationBuilder.DropTable(
                name: "OrderItems");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "Carts");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Users");

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "UserId", "Address", "CreatedAt", "CurrentToken", "Email", "EmailConfirmationToken", "FullName", "IsEmailConfirmed", "PasswordHash", "Phone", "Role" },
                values: new object[] { 99, "System", new DateTime(2026, 3, 24, 15, 53, 10, 0, DateTimeKind.Utc), null, "admin@gmail.com", null, "Administrator", true, "$2a$11$XZKAs1.hhd1cRoCH2eTlquOBAAEoA/Cfkt028hduwkCKNQ4eHd5bC", "0000000000", 0 });
        }
    }
}
