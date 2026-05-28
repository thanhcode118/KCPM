using Xunit;
using Moq;
using HomeDecorShop.Domain;
using HomeDecorShop.Application;
using System;
using System.Collections.Generic;
using System.Linq;

namespace HomeDecorShop.Tests;

public class ProductServiceTests
{
    private readonly Mock<IProductRepository> _mockProductRepository;
    private readonly Mock<ICategoryRepository> _mockCategoryRepository;
    private readonly Mock<IProductReviewRepository> _mockReviewRepository;
    private readonly ProductService _productService;
    private readonly Category _activeCategory;
    private readonly List<Product> _products;

    public ProductServiceTests()
    {
        _mockProductRepository = new Mock<IProductRepository>();
        _mockCategoryRepository = new Mock<ICategoryRepository>();
        _mockReviewRepository = new Mock<IProductReviewRepository>();

        _productService = new ProductService(
            _mockProductRepository.Object,
            _mockCategoryRepository.Object,
            _mockReviewRepository.Object
        );

        _activeCategory = new Category
        {
            Id = 1,
            Name = "Furniture",
            Slug = "furniture",
            IsActive = true
        };

        // Seed data for tests
        _products = new List<Product>
        {
            new() {
                ProductId = 1,
                ProductName = "Classic Wooden Chair",
                Sku = "CH-001",
                Slug = "classic-wooden-chair",
                Price = 120.0m,
                OldPrice = 150.0m,
                CategoryId = 1,
                Category = "Furniture",
                Brand = "WoodWorks",
                Style = "Classic",
                Material = "Wood",
                Color = "Brown",
                InStock = true,
                StockLeft = 10,
                Rating = 4.5,
                Reviews = 100,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddDays(-10),
                CategoryNavigation = _activeCategory
            },
            new() {
                ProductId = 2,
                ProductName = "Modern Metal Desk",
                Sku = "DK-002",
                Slug = "modern-metal-desk",
                Price = 250.0m,
                OldPrice = null,
                CategoryId = 1,
                Category = "Furniture",
                Brand = "SteelFlex",
                Style = "Modern",
                Material = "Steel",
                Color = "Black",
                InStock = true,
                StockLeft = 5,
                Rating = 4.8,
                Reviews = 50,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                CategoryNavigation = _activeCategory
            },
            new() {
                ProductId = 3,
                ProductName = "Soft Velvet Sofa",
                Sku = "SF-003",
                Slug = "soft-velvet-sofa",
                Price = 450.0m,
                OldPrice = 500.0m,
                CategoryId = 1,
                Category = "Furniture",
                Brand = "CozyHome",
                Style = "Modern",
                Material = "Velvet",
                Color = "Blue",
                InStock = false,
                StockLeft = 0,
                Rating = 4.0,
                Reviews = 20,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                CategoryNavigation = _activeCategory
            }
        };

        _mockProductRepository.Setup(r => r.GetAll()).Returns(_products);
    }

    /// <summary>
    /// Scenario 1: Tìm kiếm theo từ khóa thô (không phân biệt hoa thường, cắt khoảng trắng).
    /// </summary>
    [Theory]
    [InlineData("  chair  ", 1)]
    [InlineData("cHaIr", 1)]
    [InlineData("  MODERN  ", 2)] // case-insensitive + trim
    public void Search_WithRawKeyword_ShouldNormalizeTrimAndMatchCaseInsensitive(string queryText, int expectedCount)
    {
        // Arrange
        var query = new ProductQuery(
            Query: queryText,
            Category: null,
            Brand: null,
            Style: null,
            MinPrice: null,
            MaxPrice: null,
            InStockOnly: false,
            OnSaleOnly: false,
            RatingGte: null,
            SortBy: null,
            Page: 1,
            PageSize: 10
        );

        // Act
        var result = _productService.Search(query);

        // Assert
        Assert.Equal(expectedCount, result.Total);
        Assert.NotEmpty(result.Items);
    }

    /// <summary>
    /// Scenario 2: Lọc sản phẩm theo khoảng giá (MinPrice, MaxPrice).
    /// </summary>
    [Fact]
    public void Search_WithPriceRange_ShouldFilterMinAndMaxPrices()
    {
        // Arrange
        var query = new ProductQuery(
            Query: null,
            Category: null,
            Brand: null,
            Style: null,
            MinPrice: 100.0m,
            MaxPrice: 300.0m,
            InStockOnly: false,
            OnSaleOnly: false,
            RatingGte: null,
            SortBy: null,
            Page: 1,
            PageSize: 10
        );

        // Act
        var result = _productService.Search(query);

        // Assert
        Assert.Equal(2, result.Total);
        Assert.All(result.Items, p => Assert.True(p.Price >= 100.0m && p.Price <= 300.0m));
        Assert.Contains(result.Items, p => p.ProductId == 1);
        Assert.Contains(result.Items, p => p.ProductId == 2);
    }

    /// <summary>
    /// Scenario 3: Lọc sản phẩm còn hàng (InStockOnly).
    /// </summary>
    [Fact]
    public void Search_WithInStockOnly_ShouldReturnOnlyInStockProducts()
    {
        // Arrange
        var query = new ProductQuery(
            Query: null,
            Category: null,
            Brand: null,
            Style: null,
            MinPrice: null,
            MaxPrice: null,
            InStockOnly: true,
            OnSaleOnly: false,
            RatingGte: null,
            SortBy: null,
            Page: 1,
            PageSize: 10
        );

        // Act
        var result = _productService.Search(query);

        // Assert
        Assert.Equal(2, result.Total);
        Assert.All(result.Items, p => Assert.True(p.InStock || p.StockLeft > 0));
        Assert.DoesNotContain(result.Items, p => p.ProductId == 3); // Soft Velvet Sofa has InStock = false and StockLeft = 0
    }

    /// <summary>
    /// Scenario 4: Lọc sản phẩm đang giảm giá (OnSaleOnly).
    /// </summary>
    [Fact]
    public void Search_WithOnSaleOnly_ShouldReturnOnlyOnSaleProducts()
    {
        // Arrange
        var query = new ProductQuery(
            Query: null,
            Category: null,
            Brand: null,
            Style: null,
            MinPrice: null,
            MaxPrice: null,
            InStockOnly: false,
            OnSaleOnly: true,
            RatingGte: null,
            SortBy: null,
            Page: 1,
            PageSize: 10
        );

        // Act
        var result = _productService.Search(query);

        // Assert
        Assert.Equal(2, result.Total);
        Assert.All(result.Items, p => Assert.True(p.OldPrice.HasValue && p.OldPrice > p.Price));
        Assert.Contains(result.Items, p => p.ProductId == 1); // Chair: Price 120, OldPrice 150
        Assert.Contains(result.Items, p => p.ProductId == 3); // Sofa: Price 450, OldPrice 500
        Assert.DoesNotContain(result.Items, p => p.ProductId == 2); // Desk has no OldPrice
    }

    /// <summary>
    /// Scenario 5: Sắp xếp theo price-asc.
    /// </summary>
    [Fact]
    public void Search_WithSortByPriceAsc_ShouldReturnSortedByPriceAsc()
    {
        // Arrange
        var query = new ProductQuery(
            Query: null,
            Category: null,
            Brand: null,
            Style: null,
            MinPrice: null,
            MaxPrice: null,
            InStockOnly: false,
            OnSaleOnly: false,
            RatingGte: null,
            SortBy: "price-asc",
            Page: 1,
            PageSize: 10
        );

        // Act
        var result = _productService.Search(query);

        // Assert
        var sortedList = result.Items.ToList();
        Assert.Equal(3, sortedList.Count);
        Assert.Equal(1, sortedList[0].ProductId); // 120.0m
        Assert.Equal(2, sortedList[1].ProductId); // 250.0m
        Assert.Equal(3, sortedList[2].ProductId); // 450.0m
    }

    /// <summary>
    /// Scenario 6: Sắp xếp theo price-desc.
    /// </summary>
    [Fact]
    public void Search_WithSortByPriceDesc_ShouldReturnSortedByPriceDesc()
    {
        // Arrange
        var query = new ProductQuery(
            Query: null,
            Category: null,
            Brand: null,
            Style: null,
            MinPrice: null,
            MaxPrice: null,
            InStockOnly: false,
            OnSaleOnly: false,
            RatingGte: null,
            SortBy: "price-desc",
            Page: 1,
            PageSize: 10
        );

        // Act
        var result = _productService.Search(query);

        // Assert
        var sortedList = result.Items.ToList();
        Assert.Equal(3, sortedList.Count);
        Assert.Equal(3, sortedList[0].ProductId); // 450.0m
        Assert.Equal(2, sortedList[1].ProductId); // 250.0m
        Assert.Equal(1, sortedList[2].ProductId); // 120.0m
    }

    /// <summary>
    /// Scenario 7: Sắp xếp theo rating-desc.
    /// </summary>
    [Fact]
    public void Search_WithSortByRatingDesc_ShouldReturnSortedByRatingDesc()
    {
        // Arrange
        var query = new ProductQuery(
            Query: null,
            Category: null,
            Brand: null,
            Style: null,
            MinPrice: null,
            MaxPrice: null,
            InStockOnly: false,
            OnSaleOnly: false,
            RatingGte: null,
            SortBy: "rating-desc",
            Page: 1,
            PageSize: 10
        );

        // Act
        var result = _productService.Search(query);

        // Assert
        var sortedList = result.Items.ToList();
        Assert.Equal(3, sortedList.Count);
        Assert.Equal(2, sortedList[0].ProductId); // 4.8
        Assert.Equal(1, sortedList[1].ProductId); // 4.5
        Assert.Equal(3, sortedList[2].ProductId); // 4.0
    }

    /// <summary>
    /// Scenario 8: Sắp xếp theo newest.
    /// </summary>
    [Fact]
    public void Search_WithSortByNewest_ShouldReturnSortedByNewest()
    {
        // Arrange
        var query = new ProductQuery(
            Query: null,
            Category: null,
            Brand: null,
            Style: null,
            MinPrice: null,
            MaxPrice: null,
            InStockOnly: false,
            OnSaleOnly: false,
            RatingGte: null,
            SortBy: "newest",
            Page: 1,
            PageSize: 10
        );

        // Act
        var result = _productService.Search(query);

        // Assert
        var sortedList = result.Items.ToList();
        Assert.Equal(3, sortedList.Count);
        // p2: CreatedAt = -2 days (newest)
        // p3: CreatedAt = -5 days
        // p1: CreatedAt = -10 days (oldest)
        Assert.Equal(2, sortedList[0].ProductId);
        Assert.Equal(3, sortedList[1].ProductId);
        Assert.Equal(1, sortedList[2].ProductId);
    }

    /// <summary>
    /// Scenario 9: Sắp xếp theo relevance (Độ liên quan).
    /// </summary>
    [Fact]
    public void Search_WithSortByRelevance_ShouldReturnSortedByRelevanceScore()
    {
        // Arrange
        // Desk matches "Modern" at the beginning of the style name (and its brand/etc. have high relevance score).
        // Let's set query to "Modern" - p2 style is "Modern", p3 style is "Modern".
        // Desk (p2) will have higher relevance than Sofa (p3) due to higher rating and stock availability.
        var query = new ProductQuery(
            Query: "Modern",
            Category: null,
            Brand: null,
            Style: null,
            MinPrice: null,
            MaxPrice: null,
            InStockOnly: false,
            OnSaleOnly: false,
            RatingGte: null,
            SortBy: "relevance",
            Page: 1,
            PageSize: 10
        );

        // Act
        var result = _productService.Search(query);

        // Assert
        var sortedList = result.Items.ToList();
        Assert.Equal(2, sortedList.Count);
        Assert.Equal(2, sortedList[0].ProductId); // Desk (p2) - higher score because rating = 4.8 vs 4.0, InStock = true
        Assert.Equal(3, sortedList[1].ProductId); // Sofa (p3)
    }

    /// <summary>
    /// Scenario 10: Kiểm tra phân trang chính xác (đúng số lượng Page, PageSize).
    /// </summary>
    [Fact]
    public void Search_WithPagination_ShouldReturnCorrectPageAndPageSize()
    {
        // Arrange
        var query = new ProductQuery(
            Query: null,
            Category: null,
            Brand: null,
            Style: null,
            MinPrice: null,
            MaxPrice: null,
            InStockOnly: false,
            OnSaleOnly: false,
            RatingGte: null,
            SortBy: "price-asc",
            Page: 2,
            PageSize: 2
        );

        // Act
        var result = _productService.Search(query);

        // Assert
        Assert.Equal(3, result.Total); // Total matching products in DB is 3
        Assert.Equal(2, result.Page);
        Assert.Equal(2, result.PageSize);
        Assert.Single(result.Items); // page 1: 2 items, page 2: 1 item remaining
        Assert.Equal(3, result.Items.First().ProductId); // The third item in price order (Sofa, 450m)
    }
}
