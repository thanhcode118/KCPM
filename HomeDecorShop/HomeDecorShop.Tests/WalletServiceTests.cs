using Xunit;
using Moq;
using HomeDecorShop.Application;
using HomeDecorShop.Domain;

namespace HomeDecorShop.Tests;

public class WalletServiceTests
{
    private readonly Mock<IWalletRepository> _mockWalletRepository;
    private readonly Mock<IOrderRepository> _mockOrderRepository;
    private readonly Mock<IPaymentRepository> _mockPaymentRepository;
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly WalletService _walletService;

    private readonly string _testToken = "valid-token";

    private readonly User _testUser = new()
    {
        UserId = 10,
        Email = "customer@test.com",
        FullName = "Test Customer",
        Role = UserRole.Customer,
        IsActive = true,
        CurrentToken = "valid-token"
    };

    public WalletServiceTests()
    {
        _mockWalletRepository = new Mock<IWalletRepository>();
        _mockOrderRepository = new Mock<IOrderRepository>();
        _mockPaymentRepository = new Mock<IPaymentRepository>();
        _mockUserRepository = new Mock<IUserRepository>();

        _walletService = new WalletService(
            _mockWalletRepository.Object,
            _mockOrderRepository.Object,
            _mockPaymentRepository.Object,
            _mockUserRepository.Object
        );

        _mockUserRepository
            .Setup(r => r.GetByToken(_testToken))
            .Returns(_testUser);
    }

    [Fact]
    public void Deposit_ValidAmount_IncreasesWalletBalance()
    {
        // Arrange
        var wallet = new Wallet
        {
            Id = 1,
            UserId = _testUser.UserId,
            Balance = 1000m,
            UpdatedAt = DateTime.UtcNow
        };

        _mockWalletRepository
            .Setup(r => r.GetByUserId(_testUser.UserId))
            .Returns(wallet);

        _mockWalletRepository
            .Setup(r => r.Update(It.IsAny<Wallet>()))
            .Returns((Wallet w) => w);

        _mockWalletRepository
            .Setup(r => r.CreateTransaction(It.IsAny<WalletTransaction>()))
            .Returns((WalletTransaction t) => t);

        // Act
        var result = _walletService.Deposit(_testToken, 500m);

        // Assert
        Assert.Equal(1500m, result.Balance);

        _mockWalletRepository.Verify(r => r.Update(It.Is<Wallet>(
            w => w.Balance == 1500m
        )), Times.Once);

        _mockWalletRepository.Verify(r => r.CreateTransaction(It.Is<WalletTransaction>(
            t => t.WalletId == 1
                 && t.Amount == 500m
                 && t.Type == WalletTransactionType.Deposit
                 && t.Status == WalletTransactionStatus.Success
        )), Times.Once);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-100)]
    public void Deposit_AmountLessThanOrEqualZero_ThrowsRequestValidationException(decimal amount)
    {
        // Act & Assert
        var exception = Assert.Throws<RequestValidationException>(
            () => _walletService.Deposit(_testToken, amount)
        );

        Assert.Equal(AppErrorCodes.RequestValidationFailed, exception.Code);
        Assert.Contains("amount", exception.Errors.Keys);
    }

    [Fact]
    public void Deposit_WhenWalletDoesNotExist_CreatesNewWalletThenDeposit()
    {
        // Arrange
        var createdWallet = new Wallet
        {
            Id = 2,
            UserId = _testUser.UserId,
            Balance = 0m,
            UpdatedAt = DateTime.UtcNow
        };

        _mockWalletRepository
            .Setup(r => r.GetByUserId(_testUser.UserId))
            .Returns((Wallet?)null);

        _mockWalletRepository
            .Setup(r => r.Create(It.IsAny<Wallet>()))
            .Returns(createdWallet);

        _mockWalletRepository
            .Setup(r => r.Update(It.IsAny<Wallet>()))
            .Returns((Wallet w) => w);

        _mockWalletRepository
            .Setup(r => r.CreateTransaction(It.IsAny<WalletTransaction>()))
            .Returns((WalletTransaction t) => t);

        // Act
        var result = _walletService.Deposit(_testToken, 1000m);

        // Assert
        Assert.Equal(1000m, result.Balance);
        Assert.Equal(_testUser.UserId, result.UserId);

        _mockWalletRepository.Verify(r => r.Create(It.Is<Wallet>(
            w => w.UserId == _testUser.UserId && w.Balance == 0m
        )), Times.Once);

        _mockWalletRepository.Verify(r => r.CreateTransaction(It.Is<WalletTransaction>(
            t => t.Type == WalletTransactionType.Deposit
                 && t.Amount == 1000m
        )), Times.Once);
    }

    [Fact]
    public void Withdraw_ValidAmount_DecreasesWalletBalance()
    {
        // Arrange
        var wallet = new Wallet
        {
            Id = 1,
            UserId = _testUser.UserId,
            Balance = 2000m,
            UpdatedAt = DateTime.UtcNow
        };

        _mockWalletRepository
            .Setup(r => r.GetByUserId(_testUser.UserId))
            .Returns(wallet);

        _mockWalletRepository
            .Setup(r => r.Update(It.IsAny<Wallet>()))
            .Returns((Wallet w) => w);

        _mockWalletRepository
            .Setup(r => r.CreateTransaction(It.IsAny<WalletTransaction>()))
            .Returns((WalletTransaction t) => t);

        // Act
        var result = _walletService.Withdraw(_testToken, 700m);

        // Assert
        Assert.Equal(1300m, result.Balance);

        _mockWalletRepository.Verify(r => r.Update(It.Is<Wallet>(
            w => w.Balance == 1300m
        )), Times.Once);

        _mockWalletRepository.Verify(r => r.CreateTransaction(It.Is<WalletTransaction>(
            t => t.WalletId == 1
                 && t.Amount == 700m
                 && t.Type == WalletTransactionType.Withdraw
                 && t.Status == WalletTransactionStatus.Success
        )), Times.Once);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-100)]
    public void Withdraw_AmountLessThanOrEqualZero_ThrowsRequestValidationException(decimal amount)
    {
        // Act & Assert
        var exception = Assert.Throws<RequestValidationException>(
            () => _walletService.Withdraw(_testToken, amount)
        );

        Assert.Equal(AppErrorCodes.RequestValidationFailed, exception.Code);
        Assert.Contains("amount", exception.Errors.Keys);
    }

    [Fact]
    public void Withdraw_AmountGreaterThanBalance_ThrowsConflictException()
    {
        // Arrange
        var wallet = new Wallet
        {
            Id = 1,
            UserId = _testUser.UserId,
            Balance = 500m,
            UpdatedAt = DateTime.UtcNow
        };

        _mockWalletRepository
            .Setup(r => r.GetByUserId(_testUser.UserId))
            .Returns(wallet);

        // Act & Assert
        var exception = Assert.Throws<ConflictException>(
            () => _walletService.Withdraw(_testToken, 1000m)
        );

        Assert.Equal(AppErrorCodes.WalletInsufficientBalance, exception.Code);

        _mockWalletRepository.Verify(r => r.Update(It.IsAny<Wallet>()), Times.Never);
        _mockWalletRepository.Verify(r => r.CreateTransaction(It.IsAny<WalletTransaction>()), Times.Never);
    }

    [Fact]
    public void Deposit_InvalidToken_ThrowsUnauthorizedException()
    {
        // Arrange
        _mockUserRepository
            .Setup(r => r.GetByToken("wrong-token"))
            .Returns((User?)null);

        // Act & Assert
        var exception = Assert.Throws<UnauthorizedException>(
            () => _walletService.Deposit("wrong-token", 1000m)
        );

        Assert.Equal(AppErrorCodes.AuthTokenInvalid, exception.Code);
    }

    [Fact]
    public void Withdraw_InvalidToken_ThrowsUnauthorizedException()
    {
        // Arrange
        _mockUserRepository
            .Setup(r => r.GetByToken("wrong-token"))
            .Returns((User?)null);

        // Act & Assert
        var exception = Assert.Throws<UnauthorizedException>(
            () => _walletService.Withdraw("wrong-token", 1000m)
        );

        Assert.Equal(AppErrorCodes.AuthTokenInvalid, exception.Code);
    }
}