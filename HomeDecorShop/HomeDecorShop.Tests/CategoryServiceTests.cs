using Xunit;
using Moq;
using HomeDecorShop.Domain;
using HomeDecorShop.Application;
using System;
using System.Collections.Generic;
using System.Linq;

namespace HomeDecorShop.Tests;

public class CategoryServiceTests
{
    private readonly Mock<ICategoryRepository> _mockCategoryRepository;
    private readonly CategoryService _categoryService;
    private readonly CategoryGroup _activeGroup;
    private readonly List<Category> _categories;

    public CategoryServiceTests()
    {
        _mockCategoryRepository = new Mock<ICategoryRepository>();
        _categoryService = new CategoryService(_mockCategoryRepository.Object);

        _activeGroup = new CategoryGroup
        {
            Id = 1,
            Name = "Living Room",
            Slug = "living-room",
            IsActive = true,
            DisplayOrder = 1
        };

        _categories = new List<Category>
        {
            new() {
                Id = 1,
                Name = "Chairs",
                Slug = "chairs",
                IsActive = true,
                GroupId = 1,
                GroupNavigation = _activeGroup
            },
            new() {
                Id = 2,
                Name = "Tables",
                Slug = "tables",
                IsActive = true,
                GroupId = 1,
                GroupNavigation = _activeGroup
            }
        };

        _mockCategoryRepository.Setup(r => r.GetAll()).Returns(_categories);
        _mockCategoryRepository.Setup(r => r.GetById(It.IsAny<int>()))
            .Returns((int id) => _categories.FirstOrDefault(c => c.Id == id));
        _mockCategoryRepository.Setup(r => r.GetBySlug(It.IsAny<string>()))
            .Returns((string slug) => _categories.FirstOrDefault(c => c.Slug.Equals(slug, StringComparison.OrdinalIgnoreCase)));
        _mockCategoryRepository.Setup(r => r.GetGroupById(It.IsAny<int>()))
            .Returns((int id) => id == 1 ? _activeGroup : null);
    }

    /// <summary>
    /// Scenario 1: Không cho phép tắt kích hoạt (deactivate) danh mục nếu danh mục đó vẫn chứa sản phẩm đang bán (HasActiveProducts).
    /// </summary>
    [Fact]
    public void Update_DeactivateCategoryWithActiveProducts_ThrowsConflictException()
    {
        // Arrange
        var targetCategory = _categories[0]; // Active category ID 1
        var input = new CategoryUpsertInput
        {
            Name = "Chairs",
            Slug = "chairs",
            GroupId = 1,
            IsActive = false // Request deactivation
        };

        // Mock HasActiveProducts returning true
        _mockCategoryRepository.Setup(r => r.HasActiveProducts(targetCategory.Id)).Returns(true);

        // Act & Assert
        var exception = Assert.Throws<ConflictException>(() => _categoryService.Update(targetCategory.Id, input));
        Assert.Equal(AppErrorCodes.CategoryHasActiveProducts, exception.Code);
        Assert.Equal("Category cannot be deactivated while it still has active products.", exception.Message);
    }

    /// <summary>
    /// Scenario 2: Không cho phép xóa danh mục chứa bất kỳ sản phẩm nào.
    /// </summary>
    [Fact]
    public void Delete_CategoryWithProducts_ReturnsHasProducts()
    {
        // Arrange
        var targetCategoryId = 1;
        
        // Mock HasProducts returning true
        _mockCategoryRepository.Setup(r => r.HasProducts(targetCategoryId)).Returns(true);

        // Act
        var result = _categoryService.Delete(targetCategoryId);

        // Assert
        Assert.Equal(CategoryDeleteResult.HasProducts, result);
        _mockCategoryRepository.Verify(r => r.Delete(It.IsAny<int>()), Times.Never);
    }

    /// <summary>
    /// Scenario 3: Đảm bảo tính duy nhất của tên và slug danh mục khi tạo mới (Create).
    /// </summary>
    [Fact]
    public void Create_DuplicateCategoryName_ThrowsConflictException()
    {
        // Arrange
        var input = new CategoryUpsertInput
        {
            Name = "  chairs  ", // Duplicate of ID 1 (case-insensitive & trimmed)
            Slug = "new-slug",
            GroupId = 1,
            IsActive = true
        };

        // Act & Assert
        var exception = Assert.Throws<ConflictException>(() => _categoryService.Create(input));
        Assert.Equal(AppErrorCodes.CategoryNameAlreadyExists, exception.Code);
        Assert.Equal("Category name is already in use.", exception.Message);
    }

    [Fact]
    public void Create_DuplicateCategorySlug_ThrowsConflictException()
    {
        // Arrange
        var input = new CategoryUpsertInput
        {
            Name = "New Name",
            Slug = "  ChAiRs  ", // Duplicate of ID 1 (case-insensitive & trimmed)
            GroupId = 1,
            IsActive = true
        };

        // Act & Assert
        var exception = Assert.Throws<ConflictException>(() => _categoryService.Create(input));
        Assert.Equal(AppErrorCodes.CategorySlugAlreadyExists, exception.Code);
        Assert.Equal("Category slug is already in use.", exception.Message);
    }

    /// <summary>
    /// Scenario 4: Đảm bảo tính duy nhất của tên và slug danh mục khi cập nhật (Update).
    /// </summary>
    [Fact]
    public void Update_DuplicateCategoryName_ThrowsConflictException()
    {
        // Arrange
        var targetCategoryId = 2; // Category "Tables"
        var input = new CategoryUpsertInput
        {
            Name = "Chairs", // Rename to existing category "Chairs" (duplicate)
            Slug = "tables-new",
            GroupId = 1,
            IsActive = true
        };

        // Act & Assert
        var exception = Assert.Throws<ConflictException>(() => _categoryService.Update(targetCategoryId, input));
        Assert.Equal(AppErrorCodes.CategoryNameAlreadyExists, exception.Code);
        Assert.Equal("Category name is already in use.", exception.Message);
    }

    [Fact]
    public void Update_DuplicateCategorySlug_ThrowsConflictException()
    {
        // Arrange
        var targetCategoryId = 2; // Category "Tables"
        var input = new CategoryUpsertInput
        {
            Name = "Tables New",
            Slug = "chairs", // Change slug to duplicate existing slug "chairs"
            GroupId = 1,
            IsActive = true
        };

        // Act & Assert
        var exception = Assert.Throws<ConflictException>(() => _categoryService.Update(targetCategoryId, input));
        Assert.Equal(AppErrorCodes.CategorySlugAlreadyExists, exception.Code);
        Assert.Equal("Category slug is already in use.", exception.Message);
    }
}
