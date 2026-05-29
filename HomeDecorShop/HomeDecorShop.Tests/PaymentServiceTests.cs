using Moq;
using Xunit;
using HomeDecorShop.Application;
using HomeDecorShop.Domain;

namespace HomeDecorShop.Tests;

public class PaymentServiceTests
{
    private readonly Mock<IPaymentRepository> _mockPaymentRepository;
    private readonly Mock<IOrderRepository> _mockOrderRepository;
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly Mock<IWalletService> _mockWalletService;
    private readonly PaymentService _paymentService;

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

    public PaymentServiceTests()
    {
        _mockPaymentRepository = new Mock<IPaymentRepository>();
        _mockOrderRepository = new Mock<IOrderRepository>();
        _mockUserRepository = new Mock<IUserRepository>();
        _mockWalletService = new Mock<IWalletService>();

        _paymentService = new PaymentService(
            _mockPaymentRepository.Object,
            _mockOrderRepository.Object,
            _mockUserRepository.Object,
            _mockWalletService.Object
        );

        _mockUserRepository
            .Setup(r => r.GetByToken(_testToken))
            .Returns(_testUser);
    }

    [Fact]
    public void CreateVnPayPayment_ValidOrder_CreatesPendingVnPayPayment()
    {
        // Arrange
        var order = new Order
        {
            Id = 1,
            UserId = _testUser.UserId,
            OrderNumber = "ORD-VNPAY-001",
            Status = OrderStatus.PendingPayment,
            PaymentStatus = PaymentStatus.Pending,
            TotalAmount = 250000m
        };

        _mockOrderRepository
            .Setup(r => r.GetById(order.Id))
            .Returns(order);

        _mockPaymentRepository
            .Setup(r => r.GetByOrderId(order.Id))
            .Returns(Array.Empty<Payment>());

        _mockPaymentRepository
            .Setup(r => r.Create(It.IsAny<Payment>()))
            .Returns((Payment p) =>
            {
                p.Id = 1;
                p.Order = order;
                return p;
            });

        var input = new VnPayCreateUrlInput
        {
            OrderId = order.Id
        };

        // Act
        var result = _paymentService.CreateVnPayPayment(_testToken, input);

        // Assert
        Assert.Equal(1, result.PaymentId);
        Assert.Equal(order.Id, result.OrderId);
        Assert.Equal(order.OrderNumber, result.OrderNumber);
        Assert.Equal(order.TotalAmount, result.Amount);
        Assert.StartsWith($"VNPAY{order.Id}", result.TransactionCode);
        Assert.True(result.TransactionCode.All(char.IsLetterOrDigit));

        _mockPaymentRepository.Verify(r => r.Create(It.Is<Payment>(
            p => p.OrderId == order.Id
                 && p.Method == "vnpay"
                 && p.Status == PaymentStatus.Pending
                 && p.Amount == order.TotalAmount
                 && p.PaidAt == null
                 && p.TransactionCode.StartsWith($"VNPAY{order.Id}")
        )), Times.Once);
    }

    [Fact]
    public void CreateVnPayPayment_WhenPendingVnPayPaymentExists_ReturnsExistingPayment()
    {
        // Arrange
        var order = new Order
        {
            Id = 2,
            UserId = _testUser.UserId,
            OrderNumber = "ORD-VNPAY-002",
            Status = OrderStatus.PendingPayment,
            PaymentStatus = PaymentStatus.Pending,
            TotalAmount = 300000m
        };

        var existingPayment = new Payment
        {
            Id = 5,
            OrderId = order.Id,
            Order = order,
            Method = "vnpay",
            Status = PaymentStatus.Pending,
            Amount = order.TotalAmount,
            TransactionCode = "VNPAYSAFE123",
            CreatedAt = DateTime.UtcNow.AddMinutes(-5),
            UpdatedAt = DateTime.UtcNow.AddMinutes(-5)
        };

        _mockOrderRepository
            .Setup(r => r.GetById(order.Id))
            .Returns(order);

        _mockPaymentRepository
            .Setup(r => r.GetByOrderId(order.Id))
            .Returns(new[] { existingPayment });

        var input = new VnPayCreateUrlInput
        {
            OrderId = order.Id
        };

        // Act
        var result = _paymentService.CreateVnPayPayment(_testToken, input);

        // Assert
        Assert.Equal(existingPayment.Id, result.PaymentId);
        Assert.Equal(existingPayment.TransactionCode, result.TransactionCode);
        Assert.Equal(existingPayment.Amount, result.Amount);

        _mockPaymentRepository.Verify(r => r.Create(It.IsAny<Payment>()), Times.Never);
        _mockPaymentRepository.Verify(r => r.Update(It.IsAny<Payment>()), Times.Never);
    }

    [Fact]
    public void CreateVnPayPayment_ExistingPendingPaymentHasUnsafeCode_RegeneratesTransactionCode()
    {
        // Arrange
        var order = new Order
        {
            Id = 3,
            UserId = _testUser.UserId,
            OrderNumber = "ORD-VNPAY-003",
            Status = OrderStatus.PendingPayment,
            PaymentStatus = PaymentStatus.Pending,
            TotalAmount = 180000m
        };

        var existingPayment = new Payment
        {
            Id = 6,
            OrderId = order.Id,
            Order = order,
            Method = "vnpay",
            Status = PaymentStatus.Pending,
            Amount = order.TotalAmount,
            TransactionCode = "VNPAY-UNSAFE-CODE",
            CreatedAt = DateTime.UtcNow.AddMinutes(-5),
            UpdatedAt = DateTime.UtcNow.AddMinutes(-5)
        };

        _mockOrderRepository
            .Setup(r => r.GetById(order.Id))
            .Returns(order);

        _mockPaymentRepository
            .Setup(r => r.GetByOrderId(order.Id))
            .Returns(new[] { existingPayment });

        _mockPaymentRepository
            .Setup(r => r.Update(It.IsAny<Payment>()))
            .Returns((Payment p) => p);

        var input = new VnPayCreateUrlInput
        {
            OrderId = order.Id
        };

        // Act
        var result = _paymentService.CreateVnPayPayment(_testToken, input);

        // Assert
        Assert.StartsWith($"VNPAY{order.Id}", result.TransactionCode);
        Assert.True(result.TransactionCode.All(char.IsLetterOrDigit));

        _mockPaymentRepository.Verify(r => r.Update(It.Is<Payment>(
            p => p.Id == existingPayment.Id
                 && p.TransactionCode.StartsWith($"VNPAY{order.Id}")
                 && p.TransactionCode.All(char.IsLetterOrDigit)
        )), Times.Once);

        _mockPaymentRepository.Verify(r => r.Create(It.IsAny<Payment>()), Times.Never);
    }

    [Fact]
    public void CreateVnPayPayment_OrderDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        _mockOrderRepository
            .Setup(r => r.GetById(999))
            .Returns((Order?)null);

        var input = new VnPayCreateUrlInput
        {
            OrderId = 999
        };

        // Act & Assert
        var exception = Assert.Throws<NotFoundException>(
            () => _paymentService.CreateVnPayPayment(_testToken, input)
        );

        Assert.Equal(AppErrorCodes.OrderNotFound, exception.Code);
    }

    [Fact]
    public void CreateVnPayPayment_OrderBelongsToAnotherUser_ThrowsNotFoundException()
    {
        // Arrange
        var order = new Order
        {
            Id = 4,
            UserId = 999,
            OrderNumber = "ORD-OTHER",
            Status = OrderStatus.PendingPayment,
            PaymentStatus = PaymentStatus.Pending,
            TotalAmount = 100000m
        };

        _mockOrderRepository
            .Setup(r => r.GetById(order.Id))
            .Returns(order);

        var input = new VnPayCreateUrlInput
        {
            OrderId = order.Id
        };

        // Act & Assert
        var exception = Assert.Throws<NotFoundException>(
            () => _paymentService.CreateVnPayPayment(_testToken, input)
        );

        Assert.Equal(AppErrorCodes.OrderNotFound, exception.Code);
    }

    [Fact]
    public void CreateVnPayPayment_CancelledOrder_ThrowsConflictException()
    {
        // Arrange
        var order = new Order
        {
            Id = 5,
            UserId = _testUser.UserId,
            OrderNumber = "ORD-CANCELLED",
            Status = OrderStatus.Cancelled,
            PaymentStatus = PaymentStatus.Pending,
            TotalAmount = 100000m
        };

        _mockOrderRepository
            .Setup(r => r.GetById(order.Id))
            .Returns(order);

        var input = new VnPayCreateUrlInput
        {
            OrderId = order.Id
        };

        // Act & Assert
        var exception = Assert.Throws<ConflictException>(
            () => _paymentService.CreateVnPayPayment(_testToken, input)
        );

        Assert.Equal(AppErrorCodes.OrderCancelled, exception.Code);
    }

    [Fact]
    public void CreateVnPayPayment_AlreadyPaidOrder_ThrowsConflictException()
    {
        // Arrange
        var order = new Order
        {
            Id = 6,
            UserId = _testUser.UserId,
            OrderNumber = "ORD-PAID",
            Status = OrderStatus.Processing,
            PaymentStatus = PaymentStatus.Paid,
            TotalAmount = 100000m
        };

        _mockOrderRepository
            .Setup(r => r.GetById(order.Id))
            .Returns(order);

        var input = new VnPayCreateUrlInput
        {
            OrderId = order.Id
        };

        // Act & Assert
        var exception = Assert.Throws<ConflictException>(
            () => _paymentService.CreateVnPayPayment(_testToken, input)
        );

        Assert.Equal(AppErrorCodes.OrderAlreadyPaid, exception.Code);
    }

    [Fact]
    public void CreateVnPayPayment_OrderNotPendingPayment_ThrowsConflictException()
    {
        // Arrange
        var order = new Order
        {
            Id = 7,
            UserId = _testUser.UserId,
            OrderNumber = "ORD-PROCESSING",
            Status = OrderStatus.Processing,
            PaymentStatus = PaymentStatus.Pending,
            TotalAmount = 100000m
        };

        _mockOrderRepository
            .Setup(r => r.GetById(order.Id))
            .Returns(order);

        var input = new VnPayCreateUrlInput
        {
            OrderId = order.Id
        };

        // Act & Assert
        var exception = Assert.Throws<ConflictException>(
            () => _paymentService.CreateVnPayPayment(_testToken, input)
        );

        Assert.Equal(AppErrorCodes.OrderPaymentNotPending, exception.Code);
    }

    [Fact]
    public void CreateVnPayPayment_InvalidToken_ThrowsUnauthorizedException()
    {
        // Arrange
        _mockUserRepository
            .Setup(r => r.GetByToken("wrong-token"))
            .Returns((User?)null);

        var input = new VnPayCreateUrlInput
        {
            OrderId = 1
        };

        // Act & Assert
        var exception = Assert.Throws<UnauthorizedException>(
            () => _paymentService.CreateVnPayPayment("wrong-token", input)
        );

        Assert.Equal(AppErrorCodes.AuthTokenInvalid, exception.Code);
    }

    [Fact]
    public void HandleVnPayCallback_Success_UpdatesPaymentOrderAndAddsAdminRevenue()
    {
        // Arrange
        var order = new Order
        {
            Id = 8,
            UserId = _testUser.UserId,
            OrderNumber = "ORD-VNPAY-SUCCESS",
            Status = OrderStatus.PendingPayment,
            PaymentStatus = PaymentStatus.Pending,
            TotalAmount = 300000m
        };

        var payment = new Payment
        {
            Id = 10,
            OrderId = order.Id,
            Order = order,
            Method = "vnpay",
            Status = PaymentStatus.Pending,
            Amount = order.TotalAmount,
            TransactionCode = "VNPAY8SUCCESS",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _mockPaymentRepository
            .Setup(r => r.GetByTransactionCode(payment.TransactionCode))
            .Returns(payment);

        _mockOrderRepository
            .Setup(r => r.GetById(order.Id))
            .Returns(order);

        _mockPaymentRepository
            .Setup(r => r.Update(It.IsAny<Payment>()))
            .Returns((Payment p) => p);

        _mockOrderRepository
            .Setup(r => r.Update(It.IsAny<Order>()))
            .Returns((Order o) => o);

        var input = new VnPayHandleCallbackInput
        {
            TransactionCode = payment.TransactionCode,
            Amount = 30000000,
            ResponseCode = "00",
            TransactionStatus = "00",
            GatewayTransactionCode = "VNPAY-GATEWAY-001"
        };

        // Act
        var result = _paymentService.HandleVnPayCallback(input);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("paid", result.PaymentStatus);
        Assert.Equal("processing", result.OrderStatus);

        _mockPaymentRepository.Verify(r => r.Update(It.Is<Payment>(
            p => p.Id == payment.Id
                 && p.Status == PaymentStatus.Paid
                 && p.PaidAt != null
        )), Times.Once);

        _mockOrderRepository.Verify(r => r.Update(It.Is<Order>(
            o => o.Id == order.Id
                 && o.PaymentStatus == PaymentStatus.Paid
                 && o.Status == OrderStatus.Processing
        )), Times.Once);

        _mockWalletService.Verify(w => w.AddToAdminWallet(
            order.TotalAmount,
            $"REVENUE-{order.OrderNumber}",
            $"Doanh thu từ đơn hàng {order.OrderNumber}"
        ), Times.Once);
    }

    [Fact]
    public void HandleVnPayCallback_FailedPayment_MarksPaymentFailed()
    {
        // Arrange
        var order = new Order
        {
            Id = 9,
            UserId = _testUser.UserId,
            OrderNumber = "ORD-VNPAY-FAILED",
            Status = OrderStatus.PendingPayment,
            PaymentStatus = PaymentStatus.Pending,
            TotalAmount = 300000m
        };

        var payment = new Payment
        {
            Id = 11,
            OrderId = order.Id,
            Order = order,
            Method = "vnpay",
            Status = PaymentStatus.Pending,
            Amount = order.TotalAmount,
            TransactionCode = "VNPAY9FAILED"
        };

        _mockPaymentRepository
            .Setup(r => r.GetByTransactionCode(payment.TransactionCode))
            .Returns(payment);

        _mockOrderRepository
            .Setup(r => r.GetById(order.Id))
            .Returns(order);

        _mockPaymentRepository
            .Setup(r => r.Update(It.IsAny<Payment>()))
            .Returns((Payment p) => p);

        var input = new VnPayHandleCallbackInput
        {
            TransactionCode = payment.TransactionCode,
            Amount = 30000000,
            ResponseCode = "24",
            TransactionStatus = "02",
            GatewayTransactionCode = "VNPAY-GATEWAY-002"
        };

        // Act
        var result = _paymentService.HandleVnPayCallback(input);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Equal("failed", result.PaymentStatus);

        _mockPaymentRepository.Verify(r => r.Update(It.Is<Payment>(
            p => p.Id == payment.Id && p.Status == PaymentStatus.Failed
        )), Times.Once);

        _mockOrderRepository.Verify(r => r.Update(It.IsAny<Order>()), Times.Never);

        _mockWalletService.Verify(w => w.AddToAdminWallet(
            It.IsAny<decimal>(),
            It.IsAny<string>(),
            It.IsAny<string>()
        ), Times.Never);
    }

    [Fact]
    public void HandleVnPayCallback_AmountMismatch_ThrowsConflictException()
    {
        // Arrange
        var order = new Order
        {
            Id = 10,
            UserId = _testUser.UserId,
            OrderNumber = "ORD-AMOUNT-MISMATCH",
            Status = OrderStatus.PendingPayment,
            PaymentStatus = PaymentStatus.Pending,
            TotalAmount = 300000m
        };

        var payment = new Payment
        {
            Id = 12,
            OrderId = order.Id,
            Order = order,
            Method = "vnpay",
            Status = PaymentStatus.Pending,
            Amount = order.TotalAmount,
            TransactionCode = "VNPAY10AMOUNT"
        };

        _mockPaymentRepository
            .Setup(r => r.GetByTransactionCode(payment.TransactionCode))
            .Returns(payment);

        _mockOrderRepository
            .Setup(r => r.GetById(order.Id))
            .Returns(order);

        var input = new VnPayHandleCallbackInput
        {
            TransactionCode = payment.TransactionCode,
            Amount = 10000000,
            ResponseCode = "00",
            TransactionStatus = "00",
            GatewayTransactionCode = "VNPAY-GATEWAY-003"
        };

        // Act & Assert
        var exception = Assert.Throws<ConflictException>(
            () => _paymentService.HandleVnPayCallback(input)
        );

        Assert.Equal(AppErrorCodes.PaymentGatewayAmountInvalid, exception.Code);
    }

    [Fact]
    public void HandleVnPayCallback_PaymentNotFound_ThrowsNotFoundException()
    {
        // Arrange
        _mockPaymentRepository
            .Setup(r => r.GetByTransactionCode("UNKNOWN"))
            .Returns((Payment?)null);

        var input = new VnPayHandleCallbackInput
        {
            TransactionCode = "UNKNOWN",
            Amount = 10000000,
            ResponseCode = "00",
            TransactionStatus = "00",
            GatewayTransactionCode = "VNPAY-GATEWAY-004"
        };

        // Act & Assert
        var exception = Assert.Throws<NotFoundException>(
            () => _paymentService.HandleVnPayCallback(input)
        );

        Assert.Equal(AppErrorCodes.PaymentNotFound, exception.Code);
    }

    [Fact]
    public void HandleVnPayCallback_NonVnPayPayment_ThrowsConflictException()
    {
        // Arrange
        var payment = new Payment
        {
            Id = 13,
            OrderId = 11,
            Method = "wallet",
            Status = PaymentStatus.Pending,
            Amount = 100000m,
            TransactionCode = "WALLET123"
        };

        _mockPaymentRepository
            .Setup(r => r.GetByTransactionCode(payment.TransactionCode))
            .Returns(payment);

        var input = new VnPayHandleCallbackInput
        {
            TransactionCode = payment.TransactionCode,
            Amount = 10000000,
            ResponseCode = "00",
            TransactionStatus = "00",
            GatewayTransactionCode = "VNPAY-GATEWAY-005"
        };

        // Act & Assert
        var exception = Assert.Throws<ConflictException>(
            () => _paymentService.HandleVnPayCallback(input)
        );

        Assert.Equal(AppErrorCodes.PaymentGatewayCallbackInvalid, exception.Code);
    }

    [Fact]
    public void HandleVnPayCallback_DuplicateSuccess_ReturnsSuccessWithoutUpdatingAgain()
    {
        // Arrange
        var order = new Order
        {
            Id = 12,
            UserId = _testUser.UserId,
            OrderNumber = "ORD-DUPLICATE",
            Status = OrderStatus.Processing,
            PaymentStatus = PaymentStatus.Paid,
            TotalAmount = 200000m
        };

        var payment = new Payment
        {
            Id = 14,
            OrderId = order.Id,
            Order = order,
            Method = "vnpay",
            Status = PaymentStatus.Paid,
            Amount = order.TotalAmount,
            TransactionCode = "VNPAY12DUPLICATE"
        };

        _mockPaymentRepository
            .Setup(r => r.GetByTransactionCode(payment.TransactionCode))
            .Returns(payment);

        _mockOrderRepository
            .Setup(r => r.GetById(order.Id))
            .Returns(order);

        var input = new VnPayHandleCallbackInput
        {
            TransactionCode = payment.TransactionCode,
            Amount = 20000000,
            ResponseCode = "00",
            TransactionStatus = "00",
            GatewayTransactionCode = "VNPAY-GATEWAY-006"
        };

        // Act
        var result = _paymentService.HandleVnPayCallback(input);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("paid", result.PaymentStatus);
        Assert.Equal("processing", result.OrderStatus);

        _mockPaymentRepository.Verify(r => r.Update(It.IsAny<Payment>()), Times.Never);
        _mockOrderRepository.Verify(r => r.Update(It.IsAny<Order>()), Times.Never);

        _mockWalletService.Verify(w => w.AddToAdminWallet(
            It.IsAny<decimal>(),
            It.IsAny<string>(),
            It.IsAny<string>()
        ), Times.Never);
    }
}