using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using HomeDecorShop.API.Controllers;
using HomeDecorShop.Application;
using System.Collections.Generic;

namespace HomeDecorShop.Tests;

public class CategoriesControllerTests
{
    private readonly Mock<ICategoryService> _mockCategoryService;
    private readonly CategoriesController _controller;

    public CategoriesControllerTests()
    {
        _mockCategoryService = new Mock<ICategoryService>();
        _controller = new CategoriesController(_mockCategoryService.Object);
    }

    [Fact]
    public void GetAll_Success_ReturnsOkWithCategories()
    {
        // Arrange
        _mockCategoryService.Setup(s => s.GetAll()).Returns(Array.Empty<CategoryView>());

        // Act
        var response = _controller.GetAll();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<CategoryView[]>(okResult.Value);
        Assert.Empty(returnedResult);
    }

    [Fact]
    public void GetById_CategoryExists_ReturnsOkWithCategory()
    {
        // Arrange
        var categoryView = new CategoryView(1, "Living Room", "living-room", true, null);
        _mockCategoryService.Setup(s => s.GetById(1)).Returns(categoryView);

        // Act
        var response = _controller.GetById(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<CategoryView>(okResult.Value);
        Assert.Equal("Living Room", returnedResult.Name);
    }

    [Fact]
    public void GetById_CategoryDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        _mockCategoryService.Setup(s => s.GetById(99)).Returns((CategoryView?)null);

        // Act & Assert
        var exception = Assert.Throws<NotFoundException>(() => _controller.GetById(99));
        Assert.Equal(AppErrorCodes.CategoryNotFound, exception.Code);
    }

    [Fact]
    public void Create_Success_ReturnsCreatedAtAction()
    {
        // Arrange
        var input = new CategoryUpsertInput { Name = "Bedroom", Slug = "bedroom", GroupId = 1, IsActive = true };
        var categoryView = new CategoryView(2, "Bedroom", "bedroom", true, null);
        _mockCategoryService.Setup(s => s.Create(input)).Returns(categoryView);

        // Act
        var response = _controller.Create(input);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(response.Result);
        var returnedResult = Assert.IsType<CategoryView>(createdResult.Value);
        Assert.Equal(2, returnedResult.Id);
        Assert.Equal(nameof(_controller.GetById), createdResult.ActionName);
    }

    [Fact]
    public void Update_CategoryExists_ReturnsOkWithCategory()
    {
        // Arrange
        var input = new CategoryUpsertInput { Name = "Living Room Modern", Slug = "living-room-modern", GroupId = 1, IsActive = true };
        var categoryView = new CategoryView(1, "Living Room Modern", "living-room-modern", true, null);
        _mockCategoryService.Setup(s => s.Update(1, input)).Returns(categoryView);

        // Act
        var response = _controller.Update(1, input);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<CategoryView>(okResult.Value);
        Assert.Equal("Living Room Modern", returnedResult.Name);
    }

    [Fact]
    public void Update_CategoryDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var input = new CategoryUpsertInput { Name = "Living Room Modern", Slug = "living-room-modern", GroupId = 1, IsActive = true };
        _mockCategoryService.Setup(s => s.Update(99, input)).Returns((CategoryView?)null);

        // Act & Assert
        var exception = Assert.Throws<NotFoundException>(() => _controller.Update(99, input));
        Assert.Equal(AppErrorCodes.CategoryNotFound, exception.Code);
    }

    [Fact]
    public void Delete_DeletedSuccess_ReturnsNoContent()
    {
        // Arrange
        _mockCategoryService.Setup(s => s.Delete(1)).Returns(CategoryDeleteResult.Deleted);

        // Act
        var response = _controller.Delete(1);

        // Assert
        Assert.IsType<NoContentResult>(response);
    }

    [Fact]
    public void Delete_HasProducts_ThrowsConflictException()
    {
        // Arrange
        _mockCategoryService.Setup(s => s.Delete(2)).Returns(CategoryDeleteResult.HasProducts);

        // Act & Assert
        var exception = Assert.Throws<ConflictException>(() => _controller.Delete(2));
        Assert.Equal(AppErrorCodes.CategoryHasProducts, exception.Code);
    }

    [Fact]
    public void Delete_NotFound_ThrowsNotFoundException()
    {
        // Arrange
        _mockCategoryService.Setup(s => s.Delete(99)).Returns(CategoryDeleteResult.NotFound);

        // Act & Assert
        var exception = Assert.Throws<NotFoundException>(() => _controller.Delete(99));
        Assert.Equal(AppErrorCodes.CategoryNotFound, exception.Code);
    }
}
