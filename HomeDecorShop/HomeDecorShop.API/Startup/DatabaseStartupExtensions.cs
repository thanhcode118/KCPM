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
        db.Database.SetCommandTimeout(120);
        db.Database.Migrate();

        EnsureCommerceSchema(db);
        SeedAdminAccounts(db);
        // FixProductImages(db);
    }

    private static void FixProductImages(AppDbContext db)
    {
        // Map sản phẩm 51-100 sang ảnh có sẵn trong assets/images/
        var imageMap = new Dictionary<int, string>
        {
            { 51, "assets/images/lo-hoa-tron.jpg" },
            { 52, "assets/images/khung-anh-day.jpg" },
            { 53, "assets/images/den-neon-chu.jpg" },
            { 54, "assets/images/ke-go-nho.jpg" },
            { 55, "assets/images/tham-long.jpg" },
            { 56, "assets/images/nen-lo.jpg" },
            { 57, "assets/images/hop-go.jpg" },
            { 58, "assets/images/tranh-abstract.jpg" },
            { 59, "assets/images/guong-tron.jpg" },
            { 60, "assets/images/den-tron.jpg" },
            { 61, "assets/images/lo-mau.jpg" },
            { 62, "assets/images/ke-treo-nho.jpg" },
            { 63, "assets/images/khay-nho.jpg" },
            { 64, "assets/images/dong-ho-mini.jpg" },
            { 65, "assets/images/chau-gom.jpg" },
            { 66, "assets/images/den-led-trang-tri.jpg" },
            { 67, "assets/images/khung-mini.jpg" },
            { 68, "assets/images/tham-tron.jpg" },
            { 69, "assets/images/nen-dau.jpg" },
            { 70, "assets/images/hop-dung.jpg" },
            { 71, "assets/images/lo-hoa-thuy-tinh.jpg" },
            { 72, "assets/images/ke-go-2-tang.jpg" },
            { 73, "assets/images/den-ban.jpg" },
            { 74, "assets/images/tranh-hoa-la.jpg" },
            { 75, "assets/images/guong-bo-vien.jpg" },
            { 76, "assets/images/tham-long.jpg" },
            { 77, "assets/images/nen-nhai.jpg" },
            { 78, "assets/images/khay-go.jpg" },
            { 79, "assets/images/gia-sach-treo.jpg" },
            { 80, "assets/images/den-go.jpg" },
            { 81, "assets/images/lo-men-trang.jpg" },
            { 82, "assets/images/khung-anh-go.jpg" },
            { 83, "assets/images/tham-mini.jpg" },
            { 84, "assets/images/den-mini.jpg" },
            { 85, "assets/images/nen-chanh-sa.jpg" },
            { 86, "assets/images/hop-go.jpg" },
            { 87, "assets/images/tranh-phong-ngu.jpg" },
            { 88, "assets/images/guong-tron.jpg" },
            { 89, "assets/images/den-ban.jpg" },
            { 90, "assets/images/gio-cay.jpg" },
            { 91, "assets/images/tham-mini.jpg" },
            { 92, "assets/images/nen-lo.jpg" },
            { 93, "assets/images/khay-nho.jpg" },
            { 94, "assets/images/gia-sach-treo.jpg" },
            { 95, "assets/images/den-mini.jpg" },
            { 96, "assets/images/lo-gom-nham.jpg" },
            { 97, "assets/images/tranh-cua.jpg" },
            { 98, "assets/images/guong-bo-vien.jpg" },
            { 99, "assets/images/den-tron.jpg" },
            { 100, "assets/images/khay-nho.jpg" },
        };

        var productIds = imageMap.Keys.ToList();
        // Chỉ update sản phẩm nào chưa có ảnh hợp lệ (đường dẫn bị thiếu file)
        var productsToFix = db.Products
            .Where(p => productIds.Contains(p.ProductId) &&
                        (p.Image == null || !p.Image.StartsWith("assets/images/")))
            .ToList();

        if (productsToFix.Count == 0) return;

        foreach (var product in productsToFix)
        {
            if (imageMap.TryGetValue(product.ProductId, out var imgPath))
            {
                product.Image = imgPath;
                product.HoverImage = imgPath;
            }
        }

        db.SaveChanges();
    }

    private static void SeedAdminAccounts(AppDbContext db)
    {
        var admins = new[]
        {
            new { Email = "admin1", FullName = "Administrator 1", Phone = "0900000001", Password = "admin123" },
            new { Email = "admin2", FullName = "Administrator 2", Phone = "0900000002", Password = "admin123" },
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
