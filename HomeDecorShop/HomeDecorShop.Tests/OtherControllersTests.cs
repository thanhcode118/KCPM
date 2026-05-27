using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using HomeDecorShop.API.Controllers;
using HomeDecorShop.Application;
using HomeDecorShop.Application.DTOs.Marketing;
using HomeDecorShop.Domain;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace HomeDecorShop.Tests;

public class OtherControllersTests
{
    private readonly Mock<IDashboardService> _mockDashboardService;
    private readonly Mock<IFeedbackService> _mockFeedbackService;
    private readonly Mock<IMarketingService> _mockMarketingService;
    private readonly Mock<ISettingsService> _mockSettingsService;
    private readonly Mock<IWebHostEnvironment> _mockEnvironment;

    private readonly DashboardController _dashboardController;
    private readonly FeedbacksController _feedbacksController;
    private readonly LegacyFeedbackController _legacyFeedbackController;
    private readonly MarketingController _marketingController;
    private readonly SettingsController _settingsController;
    private readonly UploadController _uploadController;

    public OtherControllersTests()
    {
        _mockDashboardService = new Mock<IDashboardService>();
        _mockFeedbackService = new Mock<IFeedbackService>();
        _mockMarketingService = new Mock<IMarketingService>();
        _mockSettingsService = new Mock<ISettingsService>();
        _mockEnvironment = new Mock<IWebHostEnvironment>();

        _dashboardController = new DashboardController(_mockDashboardService.Object);
        _feedbacksController = new FeedbacksController(_mockFeedbackService.Object);
        _legacyFeedbackController = new LegacyFeedbackController(_mockFeedbackService.Object);
        _marketingController = new MarketingController(_mockMarketingService.Object);
        _settingsController = new SettingsController(_mockSettingsService.Object);
        _uploadController = new UploadController(_mockEnvironment.Object);

        // HttpContext with X-Auth-Token
        var context = new DefaultHttpContext();
        context.Request.Headers["X-Auth-Token"] = "test-token";

        var controllerContext = new ControllerContext { HttpContext = context };
        _dashboardController.ControllerContext = controllerContext;
        _feedbacksController.ControllerContext = controllerContext;
        _marketingController.ControllerContext = controllerContext;
        _settingsController.ControllerContext = controllerContext;
        _uploadController.ControllerContext = controllerContext;
    }

    [Fact]
    public void DashboardGetStats_Success_ReturnsOkWithStats()
    {
        // Arrange
        var stats = new DashboardStatsView(10000.0m, 5.0, 50, 10, 5, Array.Empty<ChartDataItem>());
        _mockDashboardService.Setup(s => s.GetStats("test-token")).Returns(stats);

        // Act
        var response = _dashboardController.GetStats();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<DashboardStatsView>(okResult.Value);
        Assert.Equal(10000.0m, returnedResult.TotalRevenue);
    }

    [Fact]
    public void FeedbacksGetAll_Success_ReturnsOkWithFeedbacks()
    {
        // Arrange
        _mockFeedbackService.Setup(s => s.GetAll()).Returns(Array.Empty<FeedbackView>());

        // Act
        var response = _feedbacksController.GetAll();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<FeedbackView[]>(okResult.Value);
        Assert.Empty(returnedResult);
    }

    [Fact]
    public void FeedbacksGetById_FeedbackExists_ReturnsOkWithFeedback()
    {
        // Arrange
        var feedback = new FeedbackView(1, "Name", "email@test.com", "Message", DateTime.UtcNow);
        _mockFeedbackService.Setup(s => s.GetById(1)).Returns(feedback);

        // Act
        var response = _feedbacksController.GetById(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<FeedbackView>(okResult.Value);
        Assert.Equal("Message", returnedResult.Message);
    }

    [Fact]
    public void FeedbacksCreate_Success_ReturnsCreatedAtAction()
    {
        // Arrange
        var input = new FeedbackUpsertInput { Name = "Name", Email = "email@test.com", Message = "Message" };
        var feedback = new FeedbackView(1, "Name", "email@test.com", "Message", DateTime.UtcNow);
        _mockFeedbackService.Setup(s => s.Create(input)).Returns(feedback);

        // Act
        var response = _feedbacksController.Create(input);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(response.Result);
        var returnedResult = Assert.IsType<FeedbackView>(createdResult.Value);
        Assert.Equal(1, returnedResult.FeedbackId);
    }

    [Fact]
    public void FeedbacksUpdate_Success_ReturnsOkWithFeedback()
    {
        // Arrange
        var input = new FeedbackUpsertInput { Name = "Name", Email = "email@test.com", Message = "Message" };
        var feedback = new FeedbackView(1, "Name", "email@test.com", "Message", DateTime.UtcNow);
        _mockFeedbackService.Setup(s => s.Update(1, input)).Returns(feedback);

        // Act
        var response = _feedbacksController.Update(1, input);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<FeedbackView>(okResult.Value);
        Assert.Equal(1, returnedResult.FeedbackId);
    }

    [Fact]
    public void FeedbacksDelete_Success_ReturnsNoContent()
    {
        // Arrange
        _mockFeedbackService.Setup(s => s.Delete(1)).Returns(true);

        // Act
        var response = _feedbacksController.Delete(1);

        // Assert
        Assert.IsType<NoContentResult>(response);
    }

    [Fact]
    public void LegacyFeedbackGetAll_Success_ReturnsOkWithFeedbacks()
    {
        // Arrange
        _mockFeedbackService.Setup(s => s.GetAll()).Returns(Array.Empty<FeedbackView>());

        // Act
        var response = _legacyFeedbackController.GetAll();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response);
        var returnedResult = Assert.IsType<FeedbackView[]>(okResult.Value);
        Assert.Empty(returnedResult);
    }

    [Fact]
    public async Task GetCoupons_Success_ReturnsOk()
    {
        // Arrange
        _mockMarketingService.Setup(s => s.GetCouponsAsync()).ReturnsAsync(Array.Empty<CouponView>());

        // Act
        var response = await _marketingController.GetCoupons();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<CouponView[]>(okResult.Value);
        Assert.Empty(returnedResult);
    }

    [Fact]
    public async Task CreateCoupon_Success_ReturnsCreatedAtAction()
    {
        // Arrange
        var input = new CreateCouponInput("DISCOUNT10", 10, DateTime.UtcNow.AddDays(7), 100);
        var coupon = new CouponView(1, "DISCOUNT10", 10, DateTime.UtcNow.AddDays(7), 100, 0, true, DateTime.UtcNow);
        _mockMarketingService.Setup(s => s.CreateCouponAsync(input)).ReturnsAsync(coupon);

        // Act
        var response = await _marketingController.CreateCoupon(input);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(response.Result);
        var returnedResult = Assert.IsType<CouponView>(createdResult.Value);
        Assert.Equal("DISCOUNT10", returnedResult.Code);
    }

    [Fact]
    public async Task DeleteCoupon_Success_ReturnsNoContent()
    {
        // Act
        var response = await _marketingController.DeleteCoupon(1);

        // Assert
        Assert.IsType<NoContentResult>(response);
        _mockMarketingService.Verify(s => s.DeleteCouponAsync(1), Times.Once);
    }

    [Fact]
    public async Task ValidateCoupon_Success_ReturnsOk()
    {
        // Arrange
        var coupon = new CouponView(1, "DISCOUNT10", 10, DateTime.UtcNow.AddDays(7), 100, 0, true, DateTime.UtcNow);
        _mockMarketingService.Setup(s => s.ValidateCouponAsync("DISCOUNT10")).ReturnsAsync(coupon);

        // Act
        var response = await _marketingController.ValidateCoupon("DISCOUNT10");

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<CouponView>(okResult.Value);
        Assert.Equal("DISCOUNT10", returnedResult.Code);
    }

    [Fact]
    public async Task GetSettings_Success_ReturnsOk()
    {
        // Arrange
        var settings = new SystemSetting { Id = 1, StoreName = "HomeDecorShop", VatPercentage = 10, DefaultShippingFee = 30000 };
        _mockSettingsService.Setup(s => s.GetSettingsAsync()).ReturnsAsync(settings);

        // Act
        var response = await _settingsController.GetSettings();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<SystemSetting>(okResult.Value);
        Assert.Equal("HomeDecorShop", returnedResult.StoreName);
    }

    [Fact]
    public async Task UpdateSettings_Success_ReturnsOk()
    {
        // Arrange
        var settings = new SystemSetting { Id = 1, StoreName = "NewStoreName", VatPercentage = 8, DefaultShippingFee = 20000 };
        _mockSettingsService.Setup(s => s.UpdateSettingsAsync(settings)).ReturnsAsync(settings);

        // Act
        var response = await _settingsController.UpdateSettings(settings);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<SystemSetting>(okResult.Value);
        Assert.Equal("NewStoreName", returnedResult.StoreName);
    }

    [Fact]
    public async Task UploadImage_NoFile_ReturnsBadRequest()
    {
        // Act
        var response = await _uploadController.UploadImage(null!);

        // Assert
        Assert.IsType<BadRequestObjectResult>(response.Result);
    }

    [Fact]
    public async Task UploadImage_Success_ReturnsOkWithResponse()
    {
        // Arrange
        var mockFile = new Mock<IFormFile>();
        var content = "dummy file content";
        var fileName = "test.jpg";
        var ms = new MemoryStream();
        var writer = new StreamWriter(ms);
        writer.Write(content);
        writer.Flush();
        ms.Position = 0;

        mockFile.Setup(f => f.Length).Returns(ms.Length);
        mockFile.Setup(f => f.FileName).Returns(fileName);
        mockFile.Setup(f => f.CopyToAsync(It.IsAny<Stream>(), It.IsAny<System.Threading.CancellationToken>()))
            .Returns(Task.CompletedTask);

        var tempPath = Path.Combine(Path.GetTempPath(), "wwwroot");
        _mockEnvironment.Setup(e => e.WebRootPath).Returns(tempPath);

        // Act
        var response = await _uploadController.UploadImage(mockFile.Object);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<UploadResponse>(okResult.Value);
        Assert.Contains("/uploads/", returnedResult.Url);
    }
}
