using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using HomeDecorShop.API.Controllers;
using HomeDecorShop.Application;
using System.Collections.Generic;

namespace HomeDecorShop.Tests;

public class CartControllerTests
{
    private readonly Mock<ICartService> _mockCartService;
    private readonly CartController _controller;

    public CartControllerTests()
    {
        _mockCartService = new Mock<ICartService>();
        _controller = new CartController(_mockCartService.Object);

        // Setup HttpContext with a test token
        var context = new DefaultHttpContext();
        context.Request.Headers["X-Auth-Token"] = "test-token";
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = context
        };
    }

    [Fact]
    public void GetCurrent_Success_ReturnsOkWithCartView()
    {
        // Arrange
        var cartView = new CartView(1, 101, Array.Empty<CartItemView>(), 0, 0.0m, DateTime.UtcNow, DateTime.UtcNow);
        _mockCartService.Setup(s => s.GetCurrent("test-token")).Returns(cartView);

        // Act
        var response = _controller.GetCurrent();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<CartView>(okResult.Value);
        Assert.Equal(101, returnedResult.UserId);
    }

    [Fact]
    public void AddItem_Success_ReturnsOkWithCartView()
    {
        // Arrange
        var input = new AddCartItemInput { ProductId = 1, Quantity = 2 };
        var cartItem = new CartItemView(1, 1, "Product 1", "sku-1", "image.jpg", 100.0m, 2, 200.0m, 10, true);
        var cartView = new CartView(1, 101, new[] { cartItem }, 2, 200.0m, DateTime.UtcNow, DateTime.UtcNow);
        _mockCartService.Setup(s => s.AddItem("test-token", input)).Returns(cartView);

        // Act
        var response = _controller.AddItem(input);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<CartView>(okResult.Value);
        Assert.Single(returnedResult.Items);
    }

    [Fact]
    public void UpdateItem_Success_ReturnsOkWithCartView()
    {
        // Arrange
        var input = new UpdateCartItemQuantityInput { Quantity = 5 };
        var cartItem = new CartItemView(1, 1, "Product 1", "sku-1", "image.jpg", 100.0m, 5, 500.0m, 10, true);
        var cartView = new CartView(1, 101, new[] { cartItem }, 5, 500.0m, DateTime.UtcNow, DateTime.UtcNow);
        _mockCartService.Setup(s => s.UpdateItem("test-token", 1, input)).Returns(cartView);

        // Act
        var response = _controller.UpdateItem(1, input);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<CartView>(okResult.Value);
        Assert.Equal(5, returnedResult.TotalQuantity);
    }

    [Fact]
    public void RemoveItem_ItemExists_ReturnsNoContent()
    {
        // Arrange
        _mockCartService.Setup(s => s.RemoveItem("test-token", 1)).Returns(true);

        // Act
        var response = _controller.RemoveItem(1);

        // Assert
        Assert.IsType<NoContentResult>(response);
    }

    [Fact]
    public void RemoveItem_ItemDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        _mockCartService.Setup(s => s.RemoveItem("test-token", 99)).Returns(false);

        // Act & Assert
        var exception = Assert.Throws<NotFoundException>(() => _controller.RemoveItem(99));
        Assert.Equal(AppErrorCodes.ResourceNotFound, exception.Code);
    }

    [Fact]
    public void Clear_Success_ReturnsNoContent()
    {
        // Arrange
        _mockCartService.Setup(s => s.Clear("test-token")).Returns(true);

        // Act
        var response = _controller.Clear();

        // Assert
        Assert.IsType<NoContentResult>(response);
    }

    [Fact]
    public void GetCurrent_NoToken_ThrowsUnauthorizedException()
    {
        // Arrange
        var emptyContext = new DefaultHttpContext();
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = emptyContext
        };

        // Act & Assert
        var exception = Assert.Throws<UnauthorizedException>(() => _controller.GetCurrent());
        Assert.Equal(AppErrorCodes.AuthTokenRequired, exception.Code);
    }
}
