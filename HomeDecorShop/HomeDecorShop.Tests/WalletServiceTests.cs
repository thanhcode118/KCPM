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
    [Fact]
public void PayOrder_ValidPendingOrder_DeductsWalletCreatesPaymentUpdatesOrderAndAddsAdminRevenue()
{
    // Arrange
    var order = new Order
    {
        Id = 1,
        UserId = _testUser.UserId,
        OrderNumber = "ORD-001",
        Status = OrderStatus.PendingPayment,
        PaymentStatus = PaymentStatus.Pending,
        TotalAmount = 400000m,
        UpdatedAt = DateTime.UtcNow
    };

    var customerWallet = new Wallet
    {
        Id = 1,
        UserId = _testUser.UserId,
        Balance = 500000m,
        UpdatedAt = DateTime.UtcNow
    };

    var admin = new User
    {
        UserId = 99,
        Email = "admin@test.com",
        FullName = "Admin",
        Role = UserRole.Admin,
        IsActive = true
    };

    var adminWallet = new Wallet
    {
        Id = 2,
        UserId = admin.UserId,
        Balance = 1000000m,
        UpdatedAt = DateTime.UtcNow
    };

    _mockOrderRepository
        .Setup(r => r.GetById(order.Id))
        .Returns(order);

    _mockWalletRepository
        .Setup(r => r.GetByUserId(It.IsAny<int>()))
        .Returns<int>(userId =>
        {
            if (userId == _testUser.UserId) return customerWallet;
            if (userId == admin.UserId) return adminWallet;
            return null;
        });

    _mockWalletRepository
        .Setup(r => r.Update(It.IsAny<Wallet>()))
        .Returns((Wallet wallet) => wallet);

    _mockWalletRepository
        .Setup(r => r.CreateTransaction(It.IsAny<WalletTransaction>()))
        .Returns((WalletTransaction transaction) => transaction);

    _mockPaymentRepository
        .Setup(r => r.Create(It.IsAny<Payment>()))
        .Returns((Payment payment) => payment);

    _mockOrderRepository
        .Setup(r => r.Update(It.IsAny<Order>()))
        .Returns((Order updatedOrder) => updatedOrder);

    _mockUserRepository
        .Setup(r => r.GetAdmins())
        .Returns(new List<User> { admin });

    // Act
    var result = _walletService.PayOrder(_testToken, order.Id);

    // Assert
    Assert.Equal(100000m, result.Balance);

    _mockWalletRepository.Verify(r => r.Update(It.Is<Wallet>(
        w => w.UserId == _testUser.UserId && w.Balance == 100000m
    )), Times.Once);

    _mockWalletRepository.Verify(r => r.CreateTransaction(It.Is<WalletTransaction>(
        t => t.WalletId == customerWallet.Id
             && t.Amount == order.TotalAmount
             && t.Type == WalletTransactionType.Payment
             && t.Status == WalletTransactionStatus.Success
             && t.Reference == order.OrderNumber
    )), Times.Once);

    _mockPaymentRepository.Verify(r => r.Create(It.Is<Payment>(
        p => p.OrderId == order.Id
             && p.Method == "wallet"
             && p.Status == PaymentStatus.Paid
             && p.Amount == order.TotalAmount
             && p.TransactionCode.StartsWith("WALLET-")
             && p.PaidAt != null
    )), Times.Once);

    _mockOrderRepository.Verify(r => r.Update(It.Is<Order>(
        o => o.Id == order.Id
             && o.PaymentStatus == PaymentStatus.Paid
             && o.Status == OrderStatus.Processing
    )), Times.Once);

    _mockWalletRepository.Verify(r => r.Update(It.Is<Wallet>(
        w => w.UserId == admin.UserId && w.Balance == 1400000m
    )), Times.Once);

    _mockWalletRepository.Verify(r => r.CreateTransaction(It.Is<WalletTransaction>(
        t => t.WalletId == adminWallet.Id
             && t.Amount == order.TotalAmount
             && t.Type == WalletTransactionType.Deposit
             && t.Status == WalletTransactionStatus.Success
             && t.Reference == $"REVENUE-{order.OrderNumber}"
    )), Times.Once);
}

[Fact]
public void PayOrder_OrderDoesNotExist_ThrowsNotFoundException()
{
    // Arrange
    _mockOrderRepository
        .Setup(r => r.GetById(999))
        .Returns((Order?)null);

    // Act & Assert
    var exception = Assert.Throws<NotFoundException>(
        () => _walletService.PayOrder(_testToken, 999)
    );

    Assert.Equal(AppErrorCodes.OrderNotFound, exception.Code);
}

[Fact]
public void PayOrder_OrderBelongsToAnotherUser_ThrowsNotFoundException()
{
    // Arrange
    var order = new Order
    {
        Id = 2,
        UserId = 999,
        OrderNumber = "ORD-OTHER",
        Status = OrderStatus.PendingPayment,
        PaymentStatus = PaymentStatus.Pending,
        TotalAmount = 100000m
    };

    _mockOrderRepository
        .Setup(r => r.GetById(order.Id))
        .Returns(order);

    // Act & Assert
    var exception = Assert.Throws<NotFoundException>(
        () => _walletService.PayOrder(_testToken, order.Id)
    );

    Assert.Equal(AppErrorCodes.OrderNotFound, exception.Code);
}

[Fact]
public void PayOrder_CancelledOrder_ThrowsConflictException()
{
    // Arrange
    var order = new Order
    {
        Id = 3,
        UserId = _testUser.UserId,
        OrderNumber = "ORD-CANCELLED",
        Status = OrderStatus.Cancelled,
        PaymentStatus = PaymentStatus.Pending,
        TotalAmount = 100000m
    };

    _mockOrderRepository
        .Setup(r => r.GetById(order.Id))
        .Returns(order);

    // Act & Assert
    var exception = Assert.Throws<ConflictException>(
        () => _walletService.PayOrder(_testToken, order.Id)
    );

    Assert.Equal(AppErrorCodes.OrderCancelled, exception.Code);
}

[Fact]
public void PayOrder_AlreadyPaidOrder_ThrowsConflictException()
{
    // Arrange
    var order = new Order
    {
        Id = 4,
        UserId = _testUser.UserId,
        OrderNumber = "ORD-PAID",
        Status = OrderStatus.Processing,
        PaymentStatus = PaymentStatus.Paid,
        TotalAmount = 100000m
    };

    _mockOrderRepository
        .Setup(r => r.GetById(order.Id))
        .Returns(order);

    // Act & Assert
    var exception = Assert.Throws<ConflictException>(
        () => _walletService.PayOrder(_testToken, order.Id)
    );

    Assert.Equal(AppErrorCodes.OrderAlreadyPaid, exception.Code);
}

[Fact]
public void PayOrder_OrderNotPendingPayment_ThrowsConflictException()
{
    // Arrange
    var order = new Order
    {
        Id = 5,
        UserId = _testUser.UserId,
        OrderNumber = "ORD-PROCESSING",
        Status = OrderStatus.Processing,
        PaymentStatus = PaymentStatus.Pending,
        TotalAmount = 100000m
    };

    _mockOrderRepository
        .Setup(r => r.GetById(order.Id))
        .Returns(order);

    // Act & Assert
    var exception = Assert.Throws<ConflictException>(
        () => _walletService.PayOrder(_testToken, order.Id)
    );

    Assert.Equal(AppErrorCodes.OrderPaymentNotPending, exception.Code);
}

[Fact]
public void PayOrder_InsufficientWalletBalance_ThrowsConflictException()
{
    // Arrange
    var order = new Order
    {
        Id = 6,
        UserId = _testUser.UserId,
        OrderNumber = "ORD-INSUFFICIENT",
        Status = OrderStatus.PendingPayment,
        PaymentStatus = PaymentStatus.Pending,
        TotalAmount = 500000m
    };

    var wallet = new Wallet
    {
        Id = 1,
        UserId = _testUser.UserId,
        Balance = 100000m,
        UpdatedAt = DateTime.UtcNow
    };

    _mockOrderRepository
        .Setup(r => r.GetById(order.Id))
        .Returns(order);

    _mockWalletRepository
        .Setup(r => r.GetByUserId(_testUser.UserId))
        .Returns(wallet);

    // Act & Assert
    var exception = Assert.Throws<ConflictException>(
        () => _walletService.PayOrder(_testToken, order.Id)
    );

    Assert.Equal(AppErrorCodes.WalletInsufficientBalance, exception.Code);

    _mockPaymentRepository.Verify(r => r.Create(It.IsAny<Payment>()), Times.Never);
    _mockOrderRepository.Verify(r => r.Update(It.IsAny<Order>()), Times.Never);
    _mockWalletRepository.Verify(r => r.CreateTransaction(It.IsAny<WalletTransaction>()), Times.Never);
}

[Fact]
public void PayOrder_InvalidToken_ThrowsUnauthorizedException()
{
    // Arrange
    _mockUserRepository
        .Setup(r => r.GetByToken("wrong-token"))
        .Returns((User?)null);

    // Act & Assert
    var exception = Assert.Throws<UnauthorizedException>(
        () => _walletService.PayOrder("wrong-token", 1)
    );

    Assert.Equal(AppErrorCodes.AuthTokenInvalid, exception.Code);
}
[Fact]
public void ProcessRefundPayment_ValidRefund_DeductsAdminWalletAndAddsCustomerWallet()
{
    // Arrange
    var customerId = _testUser.UserId;
    var refundAmount = 300000m;
    var orderNumber = "ORD-REFUND-001";

    var customerWallet = new Wallet
    {
        Id = 1,
        UserId = customerId,
        Balance = 100000m,
        UpdatedAt = DateTime.UtcNow
    };

    var admin = new User
    {
        UserId = 99,
        Email = "admin@test.com",
        FullName = "Admin",
        Role = UserRole.Admin,
        IsActive = true
    };

    var adminWallet = new Wallet
    {
        Id = 2,
        UserId = admin.UserId,
        Balance = 1000000m,
        UpdatedAt = DateTime.UtcNow
    };

    _mockUserRepository
        .Setup(r => r.GetAdmins())
        .Returns(new List<User> { admin });

    _mockWalletRepository
        .Setup(r => r.GetByUserId(It.IsAny<int>()))
        .Returns<int>(userId =>
        {
            if (userId == customerId) return customerWallet;
            if (userId == admin.UserId) return adminWallet;
            return null;
        });

    _mockWalletRepository
        .Setup(r => r.Update(It.IsAny<Wallet>()))
        .Returns((Wallet wallet) => wallet);

    _mockWalletRepository
        .Setup(r => r.CreateTransaction(It.IsAny<WalletTransaction>()))
        .Returns((WalletTransaction transaction) => transaction);

    // Act
    _walletService.ProcessRefundPayment(customerId, refundAmount, orderNumber);

    // Assert
    _mockWalletRepository.Verify(r => r.Update(It.Is<Wallet>(
        w => w.UserId == admin.UserId && w.Balance == 700000m
    )), Times.Once);

    _mockWalletRepository.Verify(r => r.Update(It.Is<Wallet>(
        w => w.UserId == customerId && w.Balance == 400000m
    )), Times.Once);

    _mockWalletRepository.Verify(r => r.CreateTransaction(It.Is<WalletTransaction>(
        t => t.WalletId == adminWallet.Id
             && t.Amount == -refundAmount
             && t.Type == WalletTransactionType.Deposit
             && t.Status == WalletTransactionStatus.Success
             && t.Reference == $"REFUND-ORDER-{orderNumber}"
    )), Times.Once);

    _mockWalletRepository.Verify(r => r.CreateTransaction(It.Is<WalletTransaction>(
        t => t.WalletId == customerWallet.Id
             && t.Amount == refundAmount
             && t.Type == WalletTransactionType.Deposit
             && t.Status == WalletTransactionStatus.Success
             && t.Reference == $"REFUND-{orderNumber}"
    )), Times.Once);
}
[Fact]
public void ProcessRefundPayment_CustomerWalletDoesNotExist_CreatesCustomerWalletAndRefunds()
{
    // Arrange
    var customerId = _testUser.UserId;
    var refundAmount = 250000m;
    var orderNumber = "ORD-REFUND-002";

    var admin = new User
    {
        UserId = 99,
        Email = "admin@test.com",
        FullName = "Admin",
        Role = UserRole.Admin,
        IsActive = true
    };

    var adminWallet = new Wallet
    {
        Id = 2,
        UserId = admin.UserId,
        Balance = 1000000m,
        UpdatedAt = DateTime.UtcNow
    };

    var createdCustomerWallet = new Wallet
    {
        Id = 3,
        UserId = customerId,
        Balance = 0m,
        UpdatedAt = DateTime.UtcNow
    };

    _mockUserRepository
        .Setup(r => r.GetAdmins())
        .Returns(new List<User> { admin });

    _mockWalletRepository
        .Setup(r => r.GetByUserId(It.IsAny<int>()))
        .Returns<int>(userId =>
        {
            if (userId == admin.UserId) return adminWallet;
            if (userId == customerId) return null;
            return null;
        });

    _mockWalletRepository
        .Setup(r => r.Create(It.Is<Wallet>(w => w.UserId == customerId)))
        .Returns(createdCustomerWallet);

    _mockWalletRepository
        .Setup(r => r.Update(It.IsAny<Wallet>()))
        .Returns((Wallet wallet) => wallet);

    _mockWalletRepository
        .Setup(r => r.CreateTransaction(It.IsAny<WalletTransaction>()))
        .Returns((WalletTransaction transaction) => transaction);

    // Act
    _walletService.ProcessRefundPayment(customerId, refundAmount, orderNumber);

    // Assert
    _mockWalletRepository.Verify(r => r.Create(It.Is<Wallet>(
        w => w.UserId == customerId && w.Balance == 0m
    )), Times.Once);

    _mockWalletRepository.Verify(r => r.Update(It.Is<Wallet>(
        w => w.UserId == customerId && w.Balance == refundAmount
    )), Times.Once);

    _mockWalletRepository.Verify(r => r.CreateTransaction(It.Is<WalletTransaction>(
        t => t.WalletId == createdCustomerWallet.Id
             && t.Amount == refundAmount
             && t.Reference == $"REFUND-{orderNumber}"
    )), Times.Once);
}
[Fact]
public void ProcessRefundPayment_AdminWalletDoesNotExist_CreatesAdminWalletAndDeductsRefundAmount()
{
    // Arrange
    var customerId = _testUser.UserId;
    var refundAmount = 200000m;
    var orderNumber = "ORD-REFUND-003";

    var admin = new User
    {
        UserId = 99,
        Email = "admin@test.com",
        FullName = "Admin",
        Role = UserRole.Admin,
        IsActive = true
    };

    var createdAdminWallet = new Wallet
    {
        Id = 4,
        UserId = admin.UserId,
        Balance = 0m,
        UpdatedAt = DateTime.UtcNow
    };

    var customerWallet = new Wallet
    {
        Id = 1,
        UserId = customerId,
        Balance = 50000m,
        UpdatedAt = DateTime.UtcNow
    };

    _mockUserRepository
        .Setup(r => r.GetAdmins())
        .Returns(new List<User> { admin });

    _mockWalletRepository
        .Setup(r => r.GetByUserId(It.IsAny<int>()))
        .Returns<int>(userId =>
        {
            if (userId == customerId) return customerWallet;
            if (userId == admin.UserId) return null;
            return null;
        });

    _mockWalletRepository
        .Setup(r => r.Create(It.Is<Wallet>(w => w.UserId == admin.UserId)))
        .Returns(createdAdminWallet);

    _mockWalletRepository
        .Setup(r => r.Update(It.IsAny<Wallet>()))
        .Returns((Wallet wallet) => wallet);

    _mockWalletRepository
        .Setup(r => r.CreateTransaction(It.IsAny<WalletTransaction>()))
        .Returns((WalletTransaction transaction) => transaction);

    // Act
    _walletService.ProcessRefundPayment(customerId, refundAmount, orderNumber);

    // Assert
    _mockWalletRepository.Verify(r => r.Create(It.Is<Wallet>(
        w => w.UserId == admin.UserId && w.Balance == 0m
    )), Times.Once);

    _mockWalletRepository.Verify(r => r.Update(It.Is<Wallet>(
        w => w.UserId == admin.UserId && w.Balance == -refundAmount
    )), Times.Once);

    _mockWalletRepository.Verify(r => r.CreateTransaction(It.Is<WalletTransaction>(
        t => t.WalletId == createdAdminWallet.Id
             && t.Amount == -refundAmount
             && t.Reference == $"REFUND-ORDER-{orderNumber}"
    )), Times.Once);
}
[Fact]
public void ProcessRefundPayment_WhenNoAdminExists_StillRefundsCustomerWallet()
{
    // Arrange
    var customerId = _testUser.UserId;
    var refundAmount = 150000m;
    var orderNumber = "ORD-REFUND-004";

    var customerWallet = new Wallet
    {
        Id = 1,
        UserId = customerId,
        Balance = 50000m,
        UpdatedAt = DateTime.UtcNow
    };

    _mockUserRepository
        .Setup(r => r.GetAdmins())
        .Returns(new List<User>());

    _mockWalletRepository
        .Setup(r => r.GetByUserId(customerId))
        .Returns(customerWallet);

    _mockWalletRepository
        .Setup(r => r.Update(It.IsAny<Wallet>()))
        .Returns((Wallet wallet) => wallet);

    _mockWalletRepository
        .Setup(r => r.CreateTransaction(It.IsAny<WalletTransaction>()))
        .Returns((WalletTransaction transaction) => transaction);

    // Act
    _walletService.ProcessRefundPayment(customerId, refundAmount, orderNumber);

    // Assert
    _mockWalletRepository.Verify(r => r.Update(It.Is<Wallet>(
        w => w.UserId == customerId && w.Balance == 200000m
    )), Times.Once);

    _mockWalletRepository.Verify(r => r.CreateTransaction(It.Is<WalletTransaction>(
        t => t.WalletId == customerWallet.Id
             && t.Amount == refundAmount
             && t.Reference == $"REFUND-{orderNumber}"
    )), Times.Once);
}
}