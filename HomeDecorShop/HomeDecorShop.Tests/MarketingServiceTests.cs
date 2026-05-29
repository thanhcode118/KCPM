using Moq;
using Xunit;
using HomeDecorShop.Application;
using HomeDecorShop.Application.DTOs.Marketing;
using HomeDecorShop.Domain;

namespace HomeDecorShop.Tests;

public class MarketingServiceTests
{
    private readonly Mock<IMarketingRepository> _mockMarketingRepository;
    private readonly MarketingService _marketingService;

    public MarketingServiceTests()
    {
        _mockMarketingRepository = new Mock<IMarketingRepository>();
        _marketingService = new MarketingService(_mockMarketingRepository.Object);
    }

    [Fact]
    public async Task GetCouponsAsync_WhenCouponsExist_ReturnsCouponViews()
    {
        // Arrange
        var coupons = new List<Coupon>
        {
            new()
            {
                Id = 1,
                Code = "SALE10",
                DiscountPercentage = 10,
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                MaxUsage = 100,
                CurrentUsage = 5,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = 2,
                Code = "SALE20",
                DiscountPercentage = 20,
                ExpiryDate = DateTime.UtcNow.AddDays(10),
                MaxUsage = 50,
                CurrentUsage = 2,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        _mockMarketingRepository
            .Setup(r => r.GetCouponsAsync())
            .ReturnsAsync(coupons);

        // Act
        var result = await _marketingService.GetCouponsAsync();

        // Assert
        Assert.Equal(2, result.Length);
        Assert.Equal("SALE10", result[0].Code);
        Assert.Equal(10, result[0].DiscountPercentage);
        Assert.Equal("SALE20", result[1].Code);
        Assert.Equal(20, result[1].DiscountPercentage);
    }

    [Fact]
    public async Task GetCouponsAsync_WhenNoCoupons_ReturnsEmptyArray()
    {
        // Arrange
        _mockMarketingRepository
            .Setup(r => r.GetCouponsAsync())
            .ReturnsAsync(Array.Empty<Coupon>());

        // Act
        var result = await _marketingService.GetCouponsAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task CreateCouponAsync_ValidInput_CreatesCouponWithUppercaseTrimmedCode()
    {
        // Arrange
        var expiryDate = DateTime.UtcNow.AddDays(7);

        var input = new CreateCouponInput(
            " sale10 ",
            10,
            expiryDate,
            100
        );

        _mockMarketingRepository
            .Setup(r => r.CreateCouponAsync(It.IsAny<Coupon>()))
            .ReturnsAsync((Coupon coupon) =>
            {
                coupon.Id = 1;
                return coupon;
            });

        // Act
        var result = await _marketingService.CreateCouponAsync(input);

        // Assert
        Assert.Equal(1, result.Id);
        Assert.Equal("SALE10", result.Code);
        Assert.Equal(10, result.DiscountPercentage);
        Assert.Equal(expiryDate, result.ExpiryDate);
        Assert.Equal(100, result.MaxUsage);
        Assert.Equal(0, result.CurrentUsage);
        Assert.True(result.IsActive);

        _mockMarketingRepository.Verify(r => r.CreateCouponAsync(It.Is<Coupon>(
            c => c.Code == "SALE10"
                 && c.DiscountPercentage == 10
                 && c.ExpiryDate == expiryDate
                 && c.MaxUsage == 100
                 && c.CurrentUsage == 0
                 && c.IsActive
        )), Times.Once);
    }

    [Fact]
    public async Task CreateCouponAsync_ValidInput_SetsCreatedAt()
    {
        // Arrange
        var beforeCreate = DateTime.UtcNow;

        var input = new CreateCouponInput(
            "NEWYEAR",
            15,
            DateTime.UtcNow.AddDays(30),
            200
        );

        _mockMarketingRepository
            .Setup(r => r.CreateCouponAsync(It.IsAny<Coupon>()))
            .ReturnsAsync((Coupon coupon) =>
            {
                coupon.Id = 2;
                return coupon;
            });

        // Act
        var result = await _marketingService.CreateCouponAsync(input);

        // Assert
        Assert.True(result.CreatedAt >= beforeCreate);
        Assert.True(result.CreatedAt <= DateTime.UtcNow);

        _mockMarketingRepository.Verify(r => r.CreateCouponAsync(It.Is<Coupon>(
            c => c.CreatedAt >= beforeCreate
        )), Times.Once);
    }

    [Fact]
    public async Task ValidateCouponAsync_ValidCoupon_ReturnsCouponView()
    {
        // Arrange
        var coupon = new Coupon
        {
            Id = 1,
            Code = "SALE10",
            DiscountPercentage = 10,
            ExpiryDate = DateTime.UtcNow.AddDays(7),
            MaxUsage = 100,
            CurrentUsage = 5,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _mockMarketingRepository
            .Setup(r => r.GetCouponByCodeAsync("SALE10"))
            .ReturnsAsync(coupon);

        // Act
        var result = await _marketingService.ValidateCouponAsync("sale10");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("SALE10", result.Code);
        Assert.Equal(10, result.DiscountPercentage);
        Assert.Equal(100, result.MaxUsage);
        Assert.Equal(5, result.CurrentUsage);

        _mockMarketingRepository.Verify(r => r.GetCouponByCodeAsync("SALE10"), Times.Once);
    }

    [Fact]
    public async Task ValidateCouponAsync_CouponNotFound_ReturnsNull()
    {
        // Arrange
        _mockMarketingRepository
            .Setup(r => r.GetCouponByCodeAsync("NOTFOUND"))
            .ReturnsAsync((Coupon?)null);

        // Act
        var result = await _marketingService.ValidateCouponAsync("notfound");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task ValidateCouponAsync_InactiveCoupon_ReturnsNull()
    {
        // Arrange
        var coupon = new Coupon
        {
            Id = 1,
            Code = "INACTIVE",
            DiscountPercentage = 10,
            ExpiryDate = DateTime.UtcNow.AddDays(7),
            MaxUsage = 100,
            CurrentUsage = 0,
            IsActive = false,
            CreatedAt = DateTime.UtcNow
        };

        _mockMarketingRepository
            .Setup(r => r.GetCouponByCodeAsync("INACTIVE"))
            .ReturnsAsync(coupon);

        // Act
        var result = await _marketingService.ValidateCouponAsync("inactive");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task ValidateCouponAsync_ExpiredCoupon_ReturnsNull()
    {
        // Arrange
        var coupon = new Coupon
        {
            Id = 1,
            Code = "EXPIRED",
            DiscountPercentage = 10,
            ExpiryDate = DateTime.UtcNow.AddDays(-1),
            MaxUsage = 100,
            CurrentUsage = 0,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _mockMarketingRepository
            .Setup(r => r.GetCouponByCodeAsync("EXPIRED"))
            .ReturnsAsync(coupon);

        // Act
        var result = await _marketingService.ValidateCouponAsync("expired");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task ValidateCouponAsync_UsageLimitReached_ReturnsNull()
    {
        // Arrange
        var coupon = new Coupon
        {
            Id = 1,
            Code = "LIMITED",
            DiscountPercentage = 10,
            ExpiryDate = DateTime.UtcNow.AddDays(7),
            MaxUsage = 10,
            CurrentUsage = 10,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _mockMarketingRepository
            .Setup(r => r.GetCouponByCodeAsync("LIMITED"))
            .ReturnsAsync(coupon);

        // Act
        var result = await _marketingService.ValidateCouponAsync("limited");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task DeleteCouponAsync_ExistingCoupon_DeletesCoupon()
    {
        // Arrange
        var coupon = new Coupon
        {
            Id = 1,
            Code = "SALE10",
            DiscountPercentage = 10,
            ExpiryDate = DateTime.UtcNow.AddDays(7),
            MaxUsage = 100,
            CurrentUsage = 0,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _mockMarketingRepository
            .Setup(r => r.GetCouponByIdAsync(1))
            .ReturnsAsync(coupon);

        _mockMarketingRepository
            .Setup(r => r.DeleteCouponAsync(coupon))
            .Returns(Task.CompletedTask);

        // Act
        await _marketingService.DeleteCouponAsync(1);

        // Assert
        _mockMarketingRepository.Verify(r => r.GetCouponByIdAsync(1), Times.Once);
        _mockMarketingRepository.Verify(r => r.DeleteCouponAsync(coupon), Times.Once);
    }

    [Fact]
    public async Task DeleteCouponAsync_CouponDoesNotExist_ThrowsKeyNotFoundException()
    {
        // Arrange
        _mockMarketingRepository
            .Setup(r => r.GetCouponByIdAsync(999))
            .ReturnsAsync((Coupon?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _marketingService.DeleteCouponAsync(999)
        );

        Assert.Contains("Coupon 999 not found", exception.Message);

        _mockMarketingRepository.Verify(r => r.DeleteCouponAsync(It.IsAny<Coupon>()), Times.Never);
    }
}