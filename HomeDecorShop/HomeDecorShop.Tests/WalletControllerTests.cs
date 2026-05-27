using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using HomeDecorShop.API.Controllers;
using HomeDecorShop.API.Payments;
using HomeDecorShop.Application;
using System;
using System.Collections.Generic;

namespace HomeDecorShop.Tests;

public class WalletControllerTests
{
    private readonly Mock<IWalletService> _mockWalletService;
    private readonly Mock<IPaymentService> _mockPaymentService;
    private readonly Mock<IOptions<VnPayOptions>> _mockOptions;
    private readonly WalletController _walletController;
    private readonly PaymentsController _paymentsController;

    public WalletControllerTests()
    {
        _mockWalletService = new Mock<IWalletService>();
        _mockPaymentService = new Mock<IPaymentService>();
        _mockOptions = new Mock<IOptions<VnPayOptions>>();

        _mockOptions.Setup(o => o.Value).Returns(new VnPayOptions
        {
            TmnCode = "TMN12345",
            HashSecret = "SECRET1234567890",
            PaymentUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
            ReturnUrl = "https://example.com/return",
            OrderType = "other",
            Locale = "vn"
        });

        _walletController = new WalletController(_mockWalletService.Object, _mockOptions.Object);
        _paymentsController = new PaymentsController(_mockPaymentService.Object, _mockOptions.Object);

        // HttpContext with X-Auth-Token
        var context = new DefaultHttpContext();
        context.Request.Headers["X-Auth-Token"] = "test-token";

        var controllerContext = new ControllerContext { HttpContext = context };
        _walletController.ControllerContext = controllerContext;
        _paymentsController.ControllerContext = controllerContext;
    }

    [Fact]
    public void GetWallet_Success_ReturnsOkWithWallet()
    {
        // Arrange
        var wallet = new WalletView(1, 101, 5000.0m, DateTime.UtcNow);
        _mockWalletService.Setup(s => s.GetOrCreate("test-token")).Returns(wallet);

        // Act
        var response = _walletController.Get();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<WalletView>(okResult.Value);
        Assert.Equal(5000.0m, returnedResult.Balance);
    }

    [Fact]
    public void GetTransactions_Success_ReturnsOkWithTransactions()
    {
        // Arrange
        _mockWalletService.Setup(s => s.GetTransactions("test-token")).Returns(Array.Empty<WalletTransactionView>());

        // Act
        var response = _walletController.GetTransactions();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<WalletTransactionView[]>(okResult.Value);
        Assert.Empty(returnedResult);
    }

    [Fact]
    public void DepositDirect_Success_ReturnsOkWithWallet()
    {
        // Arrange
        var input = new WalletDepositInput(1000.0m);
        var wallet = new WalletView(1, 101, 1000.0m, DateTime.UtcNow);
        _mockWalletService.Setup(s => s.Deposit("test-token", 1000.0m)).Returns(wallet);

        // Act
        var response = _walletController.Deposit(input);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<WalletView>(okResult.Value);
        Assert.Equal(1000.0m, returnedResult.Balance);
    }

    [Fact]
    public void Withdraw_Success_ReturnsOkWithWallet()
    {
        // Arrange
        var input = new WalletWithdrawInput(500.0m);
        var wallet = new WalletView(1, 101, 500.0m, DateTime.UtcNow);
        _mockWalletService.Setup(s => s.Withdraw("test-token", 500.0m)).Returns(wallet);

        // Act
        var response = _walletController.Withdraw(input);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<WalletView>(okResult.Value);
        Assert.Equal(500.0m, returnedResult.Balance);
    }

    [Fact]
    public void PayOrder_Success_ReturnsOkWithWallet()
    {
        // Arrange
        var input = new WalletPayOrderInput(1);
        var wallet = new WalletView(1, 101, 200.0m, DateTime.UtcNow);
        _mockWalletService.Setup(s => s.PayOrder("test-token", 1)).Returns(wallet);

        // Act
        var response = _walletController.PayOrder(input);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<WalletView>(okResult.Value);
        Assert.Equal(200.0m, returnedResult.Balance);
    }

    [Fact]
    public void CreateDepositUrl_Success_ReturnsOkWithDepositUrl()
    {
        // Arrange
        var input = new WalletDepositInput(5000.0m);
        _mockWalletService.Setup(s => s.CreatePendingDeposit("test-token", 5000.0m, It.IsAny<string>()))
            .Returns("WDEP-REF");

        // Act
        var response = _walletController.CreateDepositUrl(input);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<WalletDepositUrlResult>(okResult.Value);
        Assert.Equal("WDEP-REF", returnedResult.Reference);
        Assert.Contains("vnpay", returnedResult.PaymentUrl.ToLower());
    }

    [Fact]
    public void CreateDepositUrl_AmountTooLow_ReturnsBadRequest()
    {
        // Arrange
        var input = new WalletDepositInput(500.0m); // Min is 1000

        // Act
        var response = _walletController.CreateDepositUrl(input);

        // Assert
        Assert.IsType<BadRequestObjectResult>(response.Result);
    }

    [Fact]
    public void PaymentsGetMine_Success_ReturnsOkWithPayments()
    {
        // Arrange
        _mockPaymentService.Setup(s => s.GetMine("test-token")).Returns(Array.Empty<PaymentView>());

        // Act
        var response = _paymentsController.GetMine();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<PaymentView[]>(okResult.Value);
        Assert.Empty(returnedResult);
    }

    [Fact]
    public void PaymentsGetById_PaymentExists_ReturnsOkWithPayment()
    {
        // Arrange
        var payment = new PaymentView(1, 101, "ORD-1", "cod", "Completed", 100.0m, "TXN123", DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow);
        _mockPaymentService.Setup(s => s.GetById("test-token", 1)).Returns(payment);

        // Act
        var response = _paymentsController.GetById(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<PaymentView>(okResult.Value);
        Assert.Equal("TXN123", returnedResult.TransactionCode);
    }

    [Fact]
    public void PaymentsGetByOrderId_Success_ReturnsOkWithPayments()
    {
        // Arrange
        _mockPaymentService.Setup(s => s.GetByOrderId("test-token", 1)).Returns(Array.Empty<PaymentView>());

        // Act
        var response = _paymentsController.GetByOrderId(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<PaymentView[]>(okResult.Value);
        Assert.Empty(returnedResult);
    }

    [Fact]
    public void PaymentsProcess_Success_ReturnsCreatedAtAction()
    {
        // Arrange
        var input = new PaymentProcessInput { OrderId = 1, Method = "cod" };
        var payment = new PaymentView(1, 101, "ORD-1", "cod", "Completed", 100.0m, "TXN123", DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow);
        _mockPaymentService.Setup(s => s.Process("test-token", input)).Returns(payment);

        // Act
        var response = _paymentsController.Process(input);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(response.Result);
        var returnedResult = Assert.IsType<PaymentView>(createdResult.Value);
        Assert.Equal(1, returnedResult.Id);
    }

    [Fact]
    public void CreateVnPayUrl_Success_ReturnsCreatedAtAction()
    {
        // Arrange
        var input = new VnPayCreateUrlInput { OrderId = 1 };
        var result = new VnPayCreateUrlResult(1, 1, "ORD-1", 100.0m, "TXN123", DateTime.UtcNow);
        _mockPaymentService.Setup(s => s.CreateVnPayPayment("test-token", input)).Returns(result);

        // Act
        var response = _paymentsController.CreateVnPayUrl(input);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(response.Result);
        var returnedResult = Assert.IsType<VnPayCreateUrlApiResult>(createdResult.Value);
        Assert.Equal(1, returnedResult.OrderId);
        Assert.Contains("vnpay", returnedResult.PaymentUrl.ToLower());
    }

    [Fact]
    public void HandleVnPayReturn_MissingSignature_ThrowsRequestValidationException()
    {
        // Arrange - HttpContext query has no signature
        var context = new DefaultHttpContext();
        _paymentsController.ControllerContext = new ControllerContext { HttpContext = context };

        // Act & Assert
        var exception = Assert.Throws<RequestValidationException>(() => _paymentsController.HandleVnPayReturn());
        Assert.Equal(AppErrorCodes.PaymentGatewaySignatureInvalid, exception.Code);
    }

    [Fact]
    public void HandleVnPayIpn_MissingSignature_ReturnsOkWithInvalidSignature()
    {
        // Arrange - HttpContext query has no signature
        var context = new DefaultHttpContext();
        _paymentsController.ControllerContext = new ControllerContext { HttpContext = context };

        // Act
        var response = _paymentsController.HandleVnPayIpn();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<VnPayIpnResponse>(okResult.Value);
        Assert.Equal("97", returnedResult.RspCode);
    }
}
