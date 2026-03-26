using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeDecorShop.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedAdminFixed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "UserId", "Address", "CreatedAt", "CurrentToken", "Email", "EmailConfirmationToken", "FullName", "IsEmailConfirmed", "PasswordHash", "Phone", "Role" },
                values: new object[] { 99, "System", new DateTime(2026, 3, 24, 15, 53, 10, 0, DateTimeKind.Utc), null, "admin", null, "Administrator", true, "$2a$11$XZKAs1.hhd1cRoCH2eTlquOBAAEoA/Cfkt028hduwkCKNQ4eHd5bC", "0000000000", 0 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserId",
                keyValue: 99);
        }
    }
}
