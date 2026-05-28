using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using HomeDecorShop.API.Controllers;

namespace HomeDecorShop.Tests;

/// <summary>
/// HOM-5: Unit tests cho SettingsService
/// </summary>
public class SettingsServiceTests
{
    private readonly Mock<ISettingsRepository> _mockRepo;
    private readonly SettingsService _settingsService;

    public SettingsServiceTests()
    {
        _mockRepo = new Mock<ISettingsRepository>();
        _settingsService = new SettingsService(_mockRepo.Object);
    }

    // --- GetSettingsAsync ---

    [Fact]
    public async Task GetSettingsAsync_SettingsExist_ReturnsSettings()
    {
        // Arrange
        var settings = new SystemSetting
        {
            Id = 1,
            StoreName = "HomeDecorShop",
            VatPercentage = 10,
            DefaultShippingFee = 30000,
            ContactEmail = "contact@homedecorshop.local",
            ContactPhone = "0123456789",
            Address = "123 Main St"
        };
        _mockRepo.Setup(r => r.GetSettingsAsync()).ReturnsAsync(settings);

        // Act
        var result = await _settingsService.GetSettingsAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal("HomeDecorShop", result.StoreName);
        Assert.Equal(10, result.VatPercentage);
        Assert.Equal(30000, result.DefaultShippingFee);
        Assert.Equal("contact@homedecorshop.local", result.ContactEmail);
    }

    [Fact]
    public async Task GetSettingsAsync_SettingsNull_CreatesFallback()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetSettingsAsync()).ReturnsAsync((SystemSetting?)null);
        _mockRepo.Setup(r => r.UpdateSettingsAsync(It.IsAny<SystemSetting>()))
            .ReturnsAsync((SystemSetting s) => s);

        // Act
        var result = await _settingsService.GetSettingsAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.Id);
        _mockRepo.Verify(r => r.UpdateSettingsAsync(It.IsAny<SystemSetting>()), Times.Once);
    }

    // --- UpdateSettingsAsync ---

    [Fact]
    public async Task UpdateSettingsAsync_Success_ReturnsUpdatedSettings()
    {
        // Arrange
        var settings = new SystemSetting
        {
            Id = 1,
            StoreName = "HomeDecorShop Updated",
            VatPercentage = 15,
            DefaultShippingFee = 50000,
            ContactEmail = "updated@homedecorshop.local",
            ContactPhone = "0987654321",
            Address = "456 New St"
        };

        _mockRepo.Setup(r => r.UpdateSettingsAsync(It.IsAny<SystemSetting>()))
            .ReturnsAsync((SystemSetting s) => s);

        // Act
        var result = await _settingsService.UpdateSettingsAsync(settings);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("HomeDecorShop Updated", result.StoreName);
        Assert.Equal(15, result.VatPercentage);
        Assert.Equal(50000, result.DefaultShippingFee);
    }

    [Fact]
    public async Task UpdateSettingsAsync_SetsUpdatedAtToUtcNow()
    {
        // Arrange
        var settings = new SystemSetting
        {
            Id = 1,
            StoreName = "Test Store"
        };

        var beforeUpdate = DateTime.UtcNow;
        _mockRepo.Setup(r => r.UpdateSettingsAsync(It.IsAny<SystemSetting>()))
            .ReturnsAsync((SystemSetting s) => s);

        // Act
        var result = await _settingsService.UpdateSettingsAsync(settings);
        var afterUpdate = DateTime.UtcNow;

        // Assert
        Assert.InRange(result.UpdatedAt, beforeUpdate, afterUpdate);
    }

    [Fact]
    public async Task UpdateSettingsAsync_RepositoryCalledOnce()
    {
        // Arrange
        var settings = new SystemSetting { Id = 1, StoreName = "Test" };
        _mockRepo.Setup(r => r.UpdateSettingsAsync(It.IsAny<SystemSetting>()))
            .ReturnsAsync((SystemSetting s) => s);

        // Act
        await _settingsService.UpdateSettingsAsync(settings);

        // Assert
        _mockRepo.Verify(r => r.UpdateSettingsAsync(It.IsAny<SystemSetting>()), Times.Once);
    }
}

/// <summary>
/// HOM-5: Unit tests cho SettingsController
/// </summary>
public class SettingsControllerTests
{
    private readonly Mock<ISettingsService> _mockService;
    private readonly SettingsController _controller;

    public SettingsControllerTests()
    {
        _mockService = new Mock<ISettingsService>();
        _controller = new SettingsController(_mockService.Object);
    }

    [Fact]
    public async Task GetSettings_ReturnsOkWithSettings()
    {
        // Arrange
        var settings = new SystemSetting
        {
            Id = 1,
            StoreName = "HomeDecorShop",
            VatPercentage = 10,
            DefaultShippingFee = 30000
        };
        _mockService.Setup(s => s.GetSettingsAsync()).ReturnsAsync(settings);

        // Act
        var response = await _controller.GetSettings();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returned = Assert.IsType<SystemSetting>(okResult.Value);
        Assert.Equal("HomeDecorShop", returned.StoreName);
    }

    [Fact]
    public async Task UpdateSettings_ReturnsOkWithUpdatedSettings()
    {
        // Arrange
        var settings = new SystemSetting
        {
            Id = 1,
            StoreName = "HomeDecorShop Updated",
            VatPercentage = 15,
            DefaultShippingFee = 50000
        };
        _mockService.Setup(s => s.UpdateSettingsAsync(settings)).ReturnsAsync(settings);

        // Act
        var response = await _controller.UpdateSettings(settings);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returned = Assert.IsType<SystemSetting>(okResult.Value);
        Assert.Equal("HomeDecorShop Updated", returned.StoreName);
        Assert.Equal(15, returned.VatPercentage);
    }
}
