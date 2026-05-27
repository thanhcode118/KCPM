using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.Sqlite;
using HomeDecorShop.API.Controllers;
using HomeDecorShop.Infrastructure;
using System;
using System.Threading.Tasks;

namespace HomeDecorShop.Tests;

public class MaintenanceControllerTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly DbContextOptions<AppDbContext> _dbContextOptions;

    public MaintenanceControllerTests()
    {
        // Setup SQLite In-Memory connection and options
        _connection = new SqliteConnection("Filename=:memory:");
        _connection.Open();

        _dbContextOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(_connection)
            .Options;

        // Ensure database schema is created
        using var context = new AppDbContext(_dbContextOptions);
        context.Database.EnsureCreated();
    }

    public void Dispose()
    {
        _connection.Close();
        _connection.Dispose();
    }

    [Fact]
    public void SeedCategories_Success_ReturnsOk()
    {
        // Arrange
        using var context = new AppDbContext(_dbContextOptions);
        var controller = new MaintenanceController(context);

        // Act
        var response = controller.SeedCategories();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public void SeedProducts_Success_ReturnsOk()
    {
        // Arrange
        using var context = new AppDbContext(_dbContextOptions);
        var controller = new MaintenanceController(context);

        // Act
        var response = controller.SeedProducts();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public void SeedCatalog_Success_ReturnsOk()
    {
        // Arrange
        using var context = new AppDbContext(_dbContextOptions);
        var controller = new MaintenanceController(context);

        // Act
        var response = controller.SeedCatalog();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public void SeedSystem_Success_ReturnsOk()
    {
        // Arrange
        using var context = new AppDbContext(_dbContextOptions);
        var controller = new MaintenanceController(context);

        // Act
        var response = controller.SeedSystem();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public void SeedAll_Success_ReturnsOk()
    {
        // Arrange
        using var context = new AppDbContext(_dbContextOptions);
        var controller = new MaintenanceController(context);

        // Act
        var response = controller.SeedAll();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task UpdateDescriptions_FileNotFound_ReturnsNotFound()
    {
        // Arrange
        using var context = new AppDbContext(_dbContextOptions);
        var controller = new MaintenanceController(context);

        // Act
        var response = await controller.UpdateDescriptions();

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(response);
        Assert.Equal("SanPham.txt not found", notFoundResult.Value);
    }
}
