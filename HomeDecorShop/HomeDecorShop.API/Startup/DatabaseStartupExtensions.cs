using System.Data;
using HomeDecorShop.Application;
using HomeDecorShop.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace HomeDecorShop.API;

internal static class DatabaseStartupExtensions
{
    public static void InitializeDatabase(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
        var canConnect = db.Database.CanConnect();
        var pendingMigrations = db.Database.GetPendingMigrations().ToArray();

        if (pendingMigrations.Length > 0)
        {
            if (canConnect && HasExistingApplicationSchema(db))
            {
                Console.WriteLine(
                    "Skipping auto-migration because the application schema already exists but the EF migration history is empty or out of sync.");
            }
            else
            {
                db.Database.EnsureCreated();
            }
        }

        if (!db.Users.Any(user => user.Email == "admin1"))
        {
            userService.Register(new RegisterUserInput
            {
                Email = "admin1",
                FullName = "Administrator",
                Phone = "0123456789",
                Password = "admin123",
                Role = "admin"
            });
        }
    }

    private static bool HasExistingApplicationSchema(AppDbContext db)
    {
        var connection = db.Database.GetDbConnection();
        var shouldClose = connection.State != ConnectionState.Open;

        if (shouldClose)
        {
            connection.Open();
        }

        try
        {
            using var command = connection.CreateCommand();
            command.CommandText = """
                SELECT
                    CASE WHEN OBJECT_ID(N'dbo.Users', N'U') IS NULL THEN 0 ELSE 1 END AS UsersExists,
                    CASE WHEN OBJECT_ID(N'dbo.Addresses', N'U') IS NULL THEN 0 ELSE 1 END AS AddressesExists,
                    CASE WHEN OBJECT_ID(N'dbo.Products', N'U') IS NULL THEN 0 ELSE 1 END AS ProductsExists,
                    CASE WHEN OBJECT_ID(N'dbo.Categories', N'U') IS NULL THEN 0 ELSE 1 END AS CategoriesExists,
                    CASE WHEN OBJECT_ID(N'dbo.Feedback', N'U') IS NULL THEN 0 ELSE 1 END AS FeedbackExists,
                    CASE WHEN OBJECT_ID(N'dbo.__EFMigrationsHistory', N'U') IS NULL THEN 0 ELSE 1 END AS MigrationHistoryExists;
                """;

            using var reader = command.ExecuteReader();
            if (!reader.Read())
            {
                return false;
            }

            var allCoreTablesExist = reader.GetInt32(0) == 1 &&
                reader.GetInt32(1) == 1 &&
                reader.GetInt32(2) == 1 &&
                reader.GetInt32(3) == 1 &&
                reader.GetInt32(4) == 1;
            var migrationHistoryExists = reader.GetInt32(5) == 1;
            var appliedMigrationCount = 0;

            if (migrationHistoryExists)
            {
                using var historyCommand = connection.CreateCommand();
                historyCommand.CommandText = "SELECT COUNT(1) FROM [dbo].[__EFMigrationsHistory];";
                appliedMigrationCount = Convert.ToInt32(historyCommand.ExecuteScalar());
            }

            return allCoreTablesExist && appliedMigrationCount == 0;
        }
        finally
        {
            if (shouldClose)
            {
                connection.Close();
            }
        }
    }
}
