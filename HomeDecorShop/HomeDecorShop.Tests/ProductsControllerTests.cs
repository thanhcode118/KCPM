using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using HomeDecorShop.API.Controllers;
using HomeDecorShop.Application;
using System.Collections.Generic;

namespace HomeDecorShop.Tests;

public class ProductsControllerTests
{
    private readonly Mock<IProductService> _mockProductService;
    private readonly ProductsController _controller;

    public ProductsControllerTests()
    {
        _mockProductService = new Mock<IProductService>();
        _controller = new ProductsController(_mockProductService.Object);
    }

    [Fact]
    public void GetAll_Success_ReturnsOkWithProductListResult()
    {
        // Arrange
        var listResult = new ProductListResult(
            Array.Empty<ProductView>(),
            0,
            1,
            20,
            "name"
        );

        _mockProductService.Setup(s => s.Search(It.IsAny<ProductQuery>()))
            .Returns(listResult);

        // Act
        var response = _controller.GetAll("keyword", null, null, null, null, null, null, null, null, null, null, null);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<ProductListResult>(okResult.Value);
        Assert.Empty(returnedResult.Items);
    }

    [Fact]
    public void GetById_ProductExists_ReturnsOkWithProductView()
    {
        // Arrange
        var productView = new ProductView(
            1, "p-sku", "p-name", "p-slug", 100.0m, null, 1, "c-name", "img", "hover",
            null, null, null, 10, 4.5, 5, "p-brand", "color", "p-material", "p-style",
            true, true, DateTime.UtcNow, "p-desc", null
        );

        _mockProductService.Setup(s => s.GetById(1)).Returns(productView);

        // Act
        var response = _controller.GetById(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<ProductView>(okResult.Value);
        Assert.Equal("p-sku", returnedResult.Sku);
    }

    [Fact]
    public void GetById_ProductDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        _mockProductService.Setup(s => s.GetById(99)).Returns((ProductView?)null);

        // Act & Assert
        var exception = Assert.Throws<NotFoundException>(() => _controller.GetById(99));
        Assert.Equal(AppErrorCodes.ResourceNotFound, exception.Code);
    }

    [Fact]
    public void Create_Success_ReturnsCreatedWithProductView()
    {
        // Arrange
        var input = new ProductUpsertInput 
        { 
            Sku = "p-sku", Name = "p-name", Slug = "p-slug", Price = 100.0m, CategoryId = 1, 
            Category = "c-name", Image = "img", HoverImage = "hover", StockLeft = 10, 
            Brand = "p-brand", Color = "color", Material = "p-material", Style = "p-style", 
            InStock = true, IsActive = true 
        };
        var productView = new ProductView(
            1, "p-sku", "p-name", "p-slug", 100.0m, null, 1, "c-name", "img", "hover",
            null, null, null, 10, 0.0, 0, "p-brand", "color", "p-material", "p-style",
            true, true, DateTime.UtcNow, "p-desc", null
        );

        _mockProductService.Setup(s => s.Create(input)).Returns(productView);

        // Act
        var response = _controller.Create(input);

        // Assert
        var createdResult = Assert.IsType<CreatedResult>(response.Result);
        var returnedResult = Assert.IsType<ProductView>(createdResult.Value);
        Assert.Equal("/api/products/1", createdResult.Location);
    }

    [Fact]
    public void Update_ProductExists_ReturnsOkWithProductView()
    {
        // Arrange
        var input = new ProductUpsertInput 
        { 
            Sku = "p-sku", Name = "p-name", Slug = "p-slug", Price = 120.0m, CategoryId = 1, 
            Category = "c-name", Image = "img", HoverImage = "hover", StockLeft = 8, 
            Brand = "p-brand", Color = "color", Material = "p-material", Style = "p-style", 
            InStock = true, IsActive = true 
        };
        var productView = new ProductView(
            1, "p-sku", "p-name", "p-slug", 120.0m, null, 1, "c-name", "img", "hover",
            null, null, null, 8, 4.5, 5, "p-brand", "color", "p-material", "p-style",
            true, true, DateTime.UtcNow, "p-desc", null
        );

        _mockProductService.Setup(s => s.Update(1, input)).Returns(productView);

        // Act
        var response = _controller.Update(1, input);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<ProductView>(okResult.Value);
        Assert.Equal(120.0m, returnedResult.Price);
    }

    [Fact]
    public void Update_ProductDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var input = new ProductUpsertInput 
        { 
            Sku = "p-sku", Name = "p-name", Slug = "p-slug", Price = 120.0m, CategoryId = 1, 
            Category = "c-name", Image = "img", HoverImage = "hover", StockLeft = 8, 
            Brand = "p-brand", Color = "color", Material = "p-material", Style = "p-style", 
            InStock = true, IsActive = true 
        };
        _mockProductService.Setup(s => s.Update(99, input)).Returns((ProductView?)null);

        // Act & Assert
        var exception = Assert.Throws<NotFoundException>(() => _controller.Update(99, input));
        Assert.Equal(AppErrorCodes.ResourceNotFound, exception.Code);
    }

    [Fact]
    public void Delete_ProductExists_ReturnsNoContent()
    {
        // Arrange
        _mockProductService.Setup(s => s.Delete(1)).Returns(true);

        // Act
        var response = _controller.Delete(1);

        // Assert
        Assert.IsType<NoContentResult>(response);
    }

    [Fact]
    public void Delete_ProductDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        _mockProductService.Setup(s => s.Delete(99)).Returns(false);

        // Act & Assert
        var exception = Assert.Throws<NotFoundException>(() => _controller.Delete(99));
        Assert.Equal(AppErrorCodes.ResourceNotFound, exception.Code);
    }

    [Fact]
    public void GetReviews_Success_ReturnsOkWithReviews()
    {
        // Arrange
        _mockProductService.Setup(s => s.GetReviews(1)).Returns(Array.Empty<ProductReviewView>());

        // Act
        var response = _controller.GetReviews(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<ProductReviewView[]>(okResult.Value);
        Assert.Empty(returnedResult);
    }

    [Fact]
    public void AddReview_Success_ReturnsOkWithReview()
    {
        // Arrange
        var input = new ProductReviewCreateInput { ProductId = 1, Author = "Nguyen Van A", Rating = 5, Comment = "Good" };
        var reviewView = new ProductReviewView { Id = 1, ProductId = 1, Author = "Nguyen Van A", Rating = 5, Comment = "Good", CreatedAt = DateTime.UtcNow };

        _mockProductService.Setup(s => s.AddReview(input)).Returns(reviewView);

        // Act
        var response = _controller.AddReview(1, input);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<ProductReviewView>(okResult.Value);
        Assert.Equal(5, returnedResult.Rating);
    }

    [Fact]
    public void AddReview_MismatchedProductId_ReturnsBadRequest()
    {
        // Arrange
        var input = new ProductReviewCreateInput { ProductId = 2, Author = "Nguyen Van A", Rating = 5, Comment = "Good" };

        // Act
        var response = _controller.AddReview(1, input);

        // Assert
        Assert.IsType<BadRequestObjectResult>(response.Result);
    }
}
