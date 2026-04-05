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

        EnsureCommerceSchema(db);

        SeedAdminAccounts(db);
    }

    private static void SeedAdminAccounts(AppDbContext db)
    {
        var admins = new[]
        {
            new { Email = "admin1@homedecor.com", FullName = "Administrator 1", Phone = "0900000001", Password = "Admin@123456" },
            new { Email = "admin2@homedecor.com", FullName = "Administrator 2", Phone = "0900000002", Password = "Admin@123456" },
        };

        foreach (var admin in admins)
        {
            var normalizedEmail = admin.Email.Trim().ToLowerInvariant();
            if (db.Users.Any(u => u.Email == normalizedEmail))
            {
                continue;
            }

            var user = new HomeDecorShop.Domain.User
            {
                Email = normalizedEmail,
                FullName = admin.FullName,
                Phone = admin.Phone,
                Role = HomeDecorShop.Domain.UserRole.Admin,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(admin.Password),
                CreatedAt = DateTime.UtcNow,
                CurrentToken = Guid.NewGuid().ToString("N"),
                Addresses = new List<HomeDecorShop.Domain.Address>(),
                IsEmailConfirmed = true,
                EmailConfirmationToken = null
            };

            db.Users.Add(user);
        }

        db.SaveChanges();
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

    private static void EnsureCommerceSchema(AppDbContext db)
    {
        db.Database.ExecuteSqlRaw(
            """
            IF OBJECT_ID(N'[dbo].[Carts]', N'U') IS NULL
            BEGIN
                CREATE TABLE [dbo].[Carts]
                (
                    [Id] INT IDENTITY(1,1) NOT NULL,
                    [UserId] INT NOT NULL,
                    [CreatedAt] DATETIME2 NOT NULL,
                    [UpdatedAt] DATETIME2 NOT NULL,
                    CONSTRAINT [PK_Carts] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_Carts_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([UserId]) ON DELETE CASCADE
                );
            END;

            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Carts_UserId' AND object_id = OBJECT_ID(N'[dbo].[Carts]'))
            BEGIN
                CREATE UNIQUE INDEX [IX_Carts_UserId] ON [dbo].[Carts]([UserId]);
            END;

            IF OBJECT_ID(N'[dbo].[Orders]', N'U') IS NULL
            BEGIN
                CREATE TABLE [dbo].[Orders]
                (
                    [Id] INT IDENTITY(1,1) NOT NULL,
                    [UserId] INT NOT NULL,
                    [OrderNumber] NVARCHAR(64) NOT NULL,
                    [Status] INT NOT NULL,
                    [PaymentStatus] INT NOT NULL,
                    [Subtotal] DECIMAL(18,2) NOT NULL,
                    [ShippingFee] DECIMAL(18,2) NOT NULL,
                    [TotalAmount] DECIMAL(18,2) NOT NULL,
                    [FullName] NVARCHAR(100) NOT NULL,
                    [Phone] NVARCHAR(20) NOT NULL,
                    [Line1] NVARCHAR(200) NOT NULL,
                    [Ward] NVARCHAR(100) NOT NULL,
                    [District] NVARCHAR(100) NOT NULL,
                    [City] NVARCHAR(100) NOT NULL,
                    [Notes] NVARCHAR(500) NULL,
                    [CreatedAt] DATETIME2 NOT NULL,
                    [UpdatedAt] DATETIME2 NOT NULL,
                    CONSTRAINT [PK_Orders] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_Orders_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([UserId]) ON DELETE CASCADE
                );
            END;

            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Orders_OrderNumber' AND object_id = OBJECT_ID(N'[dbo].[Orders]'))
            BEGIN
                CREATE UNIQUE INDEX [IX_Orders_OrderNumber] ON [dbo].[Orders]([OrderNumber]);
            END;

            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Orders_UserId' AND object_id = OBJECT_ID(N'[dbo].[Orders]'))
            BEGIN
                CREATE INDEX [IX_Orders_UserId] ON [dbo].[Orders]([UserId]);
            END;

            IF OBJECT_ID(N'[dbo].[CartItems]', N'U') IS NULL
            BEGIN
                CREATE TABLE [dbo].[CartItems]
                (
                    [Id] INT IDENTITY(1,1) NOT NULL,
                    [CartId] INT NOT NULL,
                    [ProductId] INT NOT NULL,
                    [Quantity] INT NOT NULL,
                    [UnitPrice] DECIMAL(18,2) NOT NULL,
                    [CreatedAt] DATETIME2 NOT NULL,
                    [UpdatedAt] DATETIME2 NOT NULL,
                    CONSTRAINT [PK_CartItems] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_CartItems_Carts_CartId] FOREIGN KEY ([CartId]) REFERENCES [dbo].[Carts]([Id]) ON DELETE CASCADE,
                    CONSTRAINT [FK_CartItems_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [dbo].[Products]([ProductId]) ON DELETE CASCADE
                );
            END;

            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_CartItems_CartId' AND object_id = OBJECT_ID(N'[dbo].[CartItems]'))
            BEGIN
                CREATE INDEX [IX_CartItems_CartId] ON [dbo].[CartItems]([CartId]);
            END;

            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_CartItems_ProductId' AND object_id = OBJECT_ID(N'[dbo].[CartItems]'))
            BEGIN
                CREATE INDEX [IX_CartItems_ProductId] ON [dbo].[CartItems]([ProductId]);
            END;

            IF OBJECT_ID(N'[dbo].[OrderItems]', N'U') IS NULL
            BEGIN
                CREATE TABLE [dbo].[OrderItems]
                (
                    [Id] INT IDENTITY(1,1) NOT NULL,
                    [OrderId] INT NOT NULL,
                    [ProductId] INT NULL,
                    [ProductName] NVARCHAR(200) NOT NULL,
                    [ProductSku] NVARCHAR(50) NOT NULL,
                    [ProductImage] NVARCHAR(500) NOT NULL,
                    [UnitPrice] DECIMAL(18,2) NOT NULL,
                    [Quantity] INT NOT NULL,
                    [LineTotal] DECIMAL(18,2) NOT NULL,
                    CONSTRAINT [PK_OrderItems] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_OrderItems_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [dbo].[Orders]([Id]) ON DELETE CASCADE,
                    CONSTRAINT [FK_OrderItems_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [dbo].[Products]([ProductId]) ON DELETE SET NULL
                );
            END;

            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_OrderItems_OrderId' AND object_id = OBJECT_ID(N'[dbo].[OrderItems]'))
            BEGIN
                CREATE INDEX [IX_OrderItems_OrderId] ON [dbo].[OrderItems]([OrderId]);
            END;

            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_OrderItems_ProductId' AND object_id = OBJECT_ID(N'[dbo].[OrderItems]'))
            BEGIN
                CREATE INDEX [IX_OrderItems_ProductId] ON [dbo].[OrderItems]([ProductId]);
            END;

            IF OBJECT_ID(N'[dbo].[Payments]', N'U') IS NULL
            BEGIN
                CREATE TABLE [dbo].[Payments]
                (
                    [Id] INT IDENTITY(1,1) NOT NULL,
                    [OrderId] INT NOT NULL,
                    [Method] NVARCHAR(50) NOT NULL,
                    [Status] INT NOT NULL,
                    [Amount] DECIMAL(18,2) NOT NULL,
                    [TransactionCode] NVARCHAR(64) NOT NULL,
                    [PaidAt] DATETIME2 NULL,
                    [CreatedAt] DATETIME2 NOT NULL,
                    [UpdatedAt] DATETIME2 NOT NULL,
                    CONSTRAINT [PK_Payments] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_Payments_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [dbo].[Orders]([Id]) ON DELETE CASCADE
                );
            END;

            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Payments_OrderId' AND object_id = OBJECT_ID(N'[dbo].[Payments]'))
            BEGIN
                CREATE INDEX [IX_Payments_OrderId] ON [dbo].[Payments]([OrderId]);
            END;

            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Payments_TransactionCode' AND object_id = OBJECT_ID(N'[dbo].[Payments]'))
            BEGIN
                CREATE UNIQUE INDEX [IX_Payments_TransactionCode] ON [dbo].[Payments]([TransactionCode]);
            END;
            """);
    }
}
