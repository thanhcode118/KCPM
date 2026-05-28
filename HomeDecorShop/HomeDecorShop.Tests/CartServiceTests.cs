using Xunit;
using Moq;
using HomeDecorShop.Domain;
using HomeDecorShop.Application;
using System;
using System.Collections.Generic;
using System.Linq;

namespace HomeDecorShop.Tests;

public class CartServiceTests
{
    private readonly Mock<ICartRepository> _mockCartRepository;
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly Mock<IProductRepository> _mockProductRepository;
    private readonly CartService _cartService;
    private readonly User _testUser;
    private readonly string _testToken = "valid-user-token";
    private readonly Category _activeCategory;

    public CartServiceTests()
    {
        _mockCartRepository = new Mock<ICartRepository>();
        _mockUserRepository = new Mock<IUserRepository>();
        _mockProductRepository = new Mock<IProductRepository>();

        _cartService = new CartService(
            _mockCartRepository.Object,
            _mockUserRepository.Object,
            _mockProductRepository.Object
        );

        _testUser = new User
        {
            UserId = 42,
            Email = "customer@homedecor.local",
            FullName = "Nguyen Van A",
            Role = UserRole.Customer,
            IsActive = true
        };

        _activeCategory = new Category
        {
            Id = 1,
            Name = "Furniture",
            Slug = "furniture",
            IsActive = true
        };

        _mockUserRepository.Setup(r => r.GetByToken(_testToken)).Returns(_testUser);
    }

    /// <summary>
    /// Scenario 1: Ném lỗi ConflictException nếu sản phẩm bị ngưng hoạt động (IsActive = false).
    /// </summary>
    [Fact]
    public void AddItem_InactiveProduct_ThrowsConflictException()
    {
        // Arrange
        var inactiveProduct = new Product
        {
            ProductId = 10,
            ProductName = "Inactive Chair",
            Price = 100.0m,
            IsActive = false, // Inactive
            InStock = true,
            StockLeft = 10,
            CategoryNavigation = _activeCategory
        };

        _mockProductRepository.Setup(r => r.GetById(inactiveProduct.ProductId)).Returns(inactiveProduct);

        var input = new AddCartItemInput { ProductId = inactiveProduct.ProductId, Quantity = 2 };

        // Act & Assert
        var exception = Assert.Throws<ConflictException>(() => _cartService.AddItem(_testToken, input));
        Assert.Equal(AppErrorCodes.ProductInactive, exception.Code);
        Assert.Equal("Selected product is inactive and cannot be added to cart.", exception.Message);
    }

    /// <summary>
    /// Scenario 2: Ném lỗi ConflictException nếu sản phẩm đã hết hàng.
    /// </summary>
    [Fact]
    public void AddItem_OutOfStockProduct_ThrowsConflictException()
    {
        // Arrange
        var outOfStockProduct = new Product
        {
            ProductId = 11,
            ProductName = "Out of Stock Table",
            Price = 200.0m,
            IsActive = true,
            InStock = false, // Out of stock
            StockLeft = 0,    // Out of stock
            CategoryNavigation = _activeCategory
        };

        _mockProductRepository.Setup(r => r.GetById(outOfStockProduct.ProductId)).Returns(outOfStockProduct);

        var input = new AddCartItemInput { ProductId = outOfStockProduct.ProductId, Quantity = 1 };

        // Act & Assert
        var exception = Assert.Throws<ConflictException>(() => _cartService.AddItem(_testToken, input));
        Assert.Equal(AppErrorCodes.ProductOutOfStock, exception.Code);
        Assert.Equal("Selected product is out of stock.", exception.Message);
    }

    /// <summary>
    /// Scenario 3: Đảm bảo số lượng yêu cầu trong giỏ không vượt quá số lượng tồn kho thực tế (EnsureStockAvailable) khi thêm.
    /// </summary>
    [Fact]
    public void AddItem_ExceedsStock_ThrowsConflictException()
    {
        // Arrange
        var product = new Product
        {
            ProductId = 12,
            ProductName = "Limited Sofa",
            Price = 500.0m,
            IsActive = true,
            InStock = true,
            StockLeft = 3, // Only 3 items left
            CategoryNavigation = _activeCategory
        };

        _mockProductRepository.Setup(r => r.GetById(product.ProductId)).Returns(product);

        var input = new AddCartItemInput { ProductId = product.ProductId, Quantity = 5 }; // Exceeds stock (5 > 3)

        var existingCart = new Cart
        {
            Id = 1,
            UserId = _testUser.UserId,
            Items = new List<CartItem>()
        };
        _mockCartRepository.Setup(r => r.GetByUserId(_testUser.UserId)).Returns(existingCart);

        // Act & Assert
        var exception = Assert.Throws<ConflictException>(() => _cartService.AddItem(_testToken, input));
        Assert.Equal(AppErrorCodes.ProductStockExceeded, exception.Code);
        Assert.Equal($"Selected quantity exceeds available stock for product {product.ProductId}.", exception.Message);
    }

    /// <summary>
    /// Scenario 4: Đảm bảo số lượng yêu cầu trong giỏ không vượt quá số lượng tồn kho thực tế khi cập nhật.
    /// </summary>
    [Fact]
    public void UpdateItem_ExceedsStock_ThrowsConflictException()
    {
        // Arrange
        var product = new Product
        {
            ProductId = 12,
            ProductName = "Limited Sofa",
            Price = 500.0m,
            IsActive = true,
            InStock = true,
            StockLeft = 3,
            CategoryNavigation = _activeCategory
        };

        var cartItem = new CartItem
        {
            Id = 100,
            ProductId = product.ProductId,
            Quantity = 1,
            UnitPrice = product.Price,
            Product = product
        };

        var cart = new Cart
        {
            Id = 1,
            UserId = _testUser.UserId,
            Items = new List<CartItem> { cartItem }
        };

        _mockCartRepository.Setup(r => r.GetByUserId(_testUser.UserId)).Returns(cart);
        _mockProductRepository.Setup(r => r.GetById(product.ProductId)).Returns(product);

        var input = new UpdateCartItemQuantityInput { Quantity = 5 }; // Exceeds stock (5 > 3)

        // Act & Assert
        var exception = Assert.Throws<ConflictException>(() => _cartService.UpdateItem(_testToken, cartItem.Id, input));
        Assert.Equal(AppErrorCodes.ProductStockExceeded, exception.Code);
    }

    /// <summary>
    /// Scenario 5: Cập nhật số lượng giỏ hàng thành công.
    /// </summary>
    [Fact]
    public void UpdateItem_Success_UpdatesQuantity()
    {
        // Arrange
        var product = new Product
        {
            ProductId = 12,
            ProductName = "Limited Sofa",
            Price = 500.0m,
            IsActive = true,
            InStock = true,
            StockLeft = 5,
            CategoryNavigation = _activeCategory
        };

        var cartItem = new CartItem
        {
            Id = 100,
            ProductId = product.ProductId,
            Quantity = 1,
            UnitPrice = product.Price,
            Product = product
        };

        var cart = new Cart
        {
            Id = 1,
            UserId = _testUser.UserId,
            Items = new List<CartItem> { cartItem }
        };

        _mockCartRepository.Setup(r => r.GetByUserId(_testUser.UserId)).Returns(cart);
        _mockProductRepository.Setup(r => r.GetById(product.ProductId)).Returns(product);
        _mockCartRepository.Setup(r => r.Update(cart)).Returns(cart);

        var input = new UpdateCartItemQuantityInput { Quantity = 3 }; // Valid (3 <= 5)

        // Act
        var result = _cartService.UpdateItem(_testToken, cartItem.Id, input);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.Items.First().Quantity);
        _mockCartRepository.Verify(r => r.Update(cart), Times.Once);
    }

    /// <summary>
    /// Scenario 6: Xóa sản phẩm khỏi giỏ hàng thành công.
    /// </summary>
    [Fact]
    public void RemoveItem_Success_RemovesFromCart()
    {
        // Arrange
        var cartItem = new CartItem
        {
            Id = 100,
            ProductId = 12,
            Quantity = 1,
            UnitPrice = 500.0m
        };

        var cart = new Cart
        {
            Id = 1,
            UserId = _testUser.UserId,
            Items = new List<CartItem> { cartItem }
        };

        _mockCartRepository.Setup(r => r.GetByUserId(_testUser.UserId)).Returns(cart);
        _mockCartRepository.Setup(r => r.Update(cart)).Returns(cart);

        // Act
        var result = _cartService.RemoveItem(_testToken, cartItem.Id);

        // Assert
        Assert.True(result);
        Assert.Empty(cart.Items);
        _mockCartRepository.Verify(r => r.Update(cart), Times.Once);
    }

    /// <summary>
    /// Scenario 7: Làm trống giỏ hàng thành công.
    /// </summary>
    [Fact]
    public void Clear_Success_EmptiesCart()
    {
        // Arrange
        var cartItem1 = new CartItem { Id = 100, ProductId = 12, Quantity = 1, UnitPrice = 500.0m };
        var cartItem2 = new CartItem { Id = 101, ProductId = 13, Quantity = 2, UnitPrice = 100.0m };

        var cart = new Cart
        {
            Id = 1,
            UserId = _testUser.UserId,
            Items = new List<CartItem> { cartItem1, cartItem2 }
        };

        _mockCartRepository.Setup(r => r.GetByUserId(_testUser.UserId)).Returns(cart);
        _mockCartRepository.Setup(r => r.Update(cart)).Returns(cart);

        // Act
        var result = _cartService.Clear(_testToken);

        // Assert
        Assert.True(result);
        Assert.Empty(cart.Items);
        _mockCartRepository.Verify(r => r.Update(cart), Times.Once);
    }
}
