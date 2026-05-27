using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using HomeDecorShop.API.Controllers;
using HomeDecorShop.Application;
using System.Collections.Generic;

namespace HomeDecorShop.Tests;

public class OrdersControllerTests
{
    private readonly Mock<IOrderService> _mockOrderService;
    private readonly OrdersController _ordersController;
    private readonly AdminOrdersController _adminOrdersController;

    public OrdersControllerTests()
    {
        _mockOrderService = new Mock<IOrderService>();
        _ordersController = new OrdersController(_mockOrderService.Object);
        _adminOrdersController = new AdminOrdersController(_mockOrderService.Object);

        // Setup HttpContext with a test token
        var context = new DefaultHttpContext();
        context.Request.Headers["X-Auth-Token"] = "test-token";
        
        _ordersController.ControllerContext = new ControllerContext
        {
            HttpContext = context
        };
        _adminOrdersController.ControllerContext = new ControllerContext
        {
            HttpContext = context
        };
    }

    [Fact]
    public void GetMine_Success_ReturnsOkWithOrders()
    {
        // Arrange
        _mockOrderService.Setup(s => s.GetMine("test-token")).Returns(Array.Empty<OrderView>());

        // Act
        var response = _ordersController.GetMine();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<OrderView[]>(okResult.Value);
        Assert.Empty(returnedResult);
    }

    [Fact]
    public void GetById_OrderExists_ReturnsOkWithOrder()
    {
        // Arrange
        var orderView = new OrderView(1, "ORD-1", "Pending", "Unpaid", 100.0m, 10.0m, 110.0m, "Nguyen Van A", "0123456789", "Line 1", "Ward 1", "District 1", "City 1", null, DateTime.UtcNow, DateTime.UtcNow, Array.Empty<OrderItemView>());
        _mockOrderService.Setup(s => s.GetById("test-token", 1)).Returns(orderView);

        // Act
        var response = _ordersController.GetById(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<OrderView>(okResult.Value);
        Assert.Equal("ORD-1", returnedResult.OrderNumber);
    }

    [Fact]
    public void GetById_OrderDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        _mockOrderService.Setup(s => s.GetById("test-token", 99)).Returns((OrderView?)null);

        // Act & Assert
        var exception = Assert.Throws<NotFoundException>(() => _ordersController.GetById(99));
        Assert.Equal(AppErrorCodes.ResourceNotFound, exception.Code);
    }

    [Fact]
    public void Create_Success_ReturnsCreatedAtAction()
    {
        // Arrange
        var input = new PlaceOrderInput { AddressId = 1, FullName = "Nguyen Van A", Phone = "0123456789", Line1 = "Hanoi", Ward = "Ward 1", District = "District 1", City = "Hanoi" };
        var orderView = new OrderView(1, "ORD-1", "Pending", "Unpaid", 100.0m, 10.0m, 110.0m, "Nguyen Van A", "0123456789", "Line 1", "Ward 1", "District 1", "City 1", null, DateTime.UtcNow, DateTime.UtcNow, Array.Empty<OrderItemView>());
        _mockOrderService.Setup(s => s.PlaceOrder("test-token", input)).Returns(orderView);

        // Act
        var response = _ordersController.Create(input);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(response.Result);
        var returnedResult = Assert.IsType<OrderView>(createdResult.Value);
        Assert.Equal(1, returnedResult.Id);
        Assert.Equal(nameof(_ordersController.GetById), createdResult.ActionName);
    }

    [Fact]
    public void Cancel_OrderExists_ReturnsOkWithOrder()
    {
        // Arrange
        var orderView = new OrderView(1, "ORD-1", "Cancelled", "Unpaid", 100.0m, 10.0m, 110.0m, "Nguyen Van A", "0123456789", "Line 1", "Ward 1", "District 1", "City 1", null, DateTime.UtcNow, DateTime.UtcNow, Array.Empty<OrderItemView>());
        _mockOrderService.Setup(s => s.Cancel("test-token", 1)).Returns(orderView);

        // Act
        var response = _ordersController.Cancel(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<OrderView>(okResult.Value);
        Assert.Equal("Cancelled", returnedResult.Status);
    }

    [Fact]
    public void RequestRefund_Success_ReturnsOkWithOrder()
    {
        // Arrange
        var input = new RequestRefundInput("Broken item");
        var orderView = new OrderView(1, "ORD-1", "RefundRequested", "Paid", 100.0m, 10.0m, 110.0m, "Nguyen Van A", "0123456789", "Line 1", "Ward 1", "District 1", "City 1", "Broken item", DateTime.UtcNow, DateTime.UtcNow, Array.Empty<OrderItemView>());
        _mockOrderService.Setup(s => s.RequestRefund("test-token", 1, "Broken item")).Returns(orderView);

        // Act
        var response = _ordersController.RequestRefund(1, input);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<OrderView>(okResult.Value);
        Assert.Equal("RefundRequested", returnedResult.Status);
    }

    [Fact]
    public void AdminGetAll_Success_ReturnsOkWithOrders()
    {
        // Arrange
        _mockOrderService.Setup(s => s.GetAll("test-token")).Returns(Array.Empty<OrderView>());

        // Act
        var response = _adminOrdersController.GetAll();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<OrderView[]>(okResult.Value);
        Assert.Empty(returnedResult);
    }

    [Fact]
    public void AdminUpdateStatus_Success_ReturnsOkWithOrder()
    {
        // Arrange
        var orderView = new OrderView(1, "ORD-1", "Processing", "Unpaid", 100.0m, 10.0m, 110.0m, "Nguyen Van A", "0123456789", "Line 1", "Ward 1", "District 1", "City 1", null, DateTime.UtcNow, DateTime.UtcNow, Array.Empty<OrderItemView>());
        _mockOrderService.Setup(s => s.UpdateStatus("test-token", 1, "processing")).Returns(orderView);

        // Act
        var response = _adminOrdersController.UpdateStatus(1, "processing");

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<OrderView>(okResult.Value);
        Assert.Equal("Processing", returnedResult.Status);
    }

    [Fact]
    public void AdminProcessRefund_Success_ReturnsOkWithOrder()
    {
        // Arrange
        var orderView = new OrderView(1, "ORD-1", "Refunded", "Refunded", 100.0m, 10.0m, 110.0m, "Nguyen Van A", "0123456789", "Line 1", "Ward 1", "District 1", "City 1", "Broken item", DateTime.UtcNow, DateTime.UtcNow, Array.Empty<OrderItemView>());
        _mockOrderService.Setup(s => s.ProcessRefund("test-token", 1, true)).Returns(orderView);

        // Act
        var response = _adminOrdersController.ProcessRefund(1, true);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<OrderView>(okResult.Value);
        Assert.Equal("Refunded", returnedResult.Status);
    }
}
