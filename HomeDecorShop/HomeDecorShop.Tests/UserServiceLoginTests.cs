using Xunit;
using Moq;
using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using System.Collections.Generic;

namespace HomeDecorShop.Tests;

/// <summary>
/// HOM-3: Unit tests cho UserService - Login
/// </summary>
public class UserServiceLoginTests
{
    private readonly Mock<IUserRepository> _mockRepo;
    private readonly Mock<IEmailService> _mockEmail;
    private readonly UserService _userService;

    private readonly User _validUser;

    public UserServiceLoginTests()
    {
        _mockRepo = new Mock<IUserRepository>();
        _mockEmail = new Mock<IEmailService>();
        _userService = new UserService(_mockRepo.Object, _mockEmail.Object);

        _validUser = new User
        {
            UserId = 1,
            Email = "admin1@homedecorshop.local",
            FullName = "Admin One",
            Phone = "0123456789",
            Role = UserRole.Admin,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            IsActive = true,
            IsEmailConfirmed = true,
            Addresses = new List<Address>()
        };
    }

    [Fact]
    public void Login_ValidCredentials_ReturnsAuthResultWithToken()
    {
        // Arrange
        var input = new LoginInput { Email = "admin1@homedecorshop.local", Password = "admin123" };
        _mockRepo.Setup(r => r.GetByEmail("admin1@homedecorshop.local")).Returns(_validUser);
        _mockRepo.Setup(r => r.Update(It.IsAny<User>())).Returns((User u) => u);

        // Act
        var result = _userService.Login(input);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result!.Token);
        Assert.NotEmpty(result.Token);
        Assert.Equal("admin1@homedecorshop.local", result.User.Email);
    }

    [Fact]
    public void Login_WrongPassword_ReturnsNull()
    {
        // Arrange
        var input = new LoginInput { Email = "admin1@homedecorshop.local", Password = "WrongPassword_123" };
        _mockRepo.Setup(r => r.GetByEmail("admin1@homedecorshop.local")).Returns(_validUser);

        // Act
        var result = _userService.Login(input);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public void Login_NonExistentEmail_ReturnsNull()
    {
        // Arrange
        var input = new LoginInput { Email = "notexist@homedecorshop.local", Password = "Password123" };
        _mockRepo.Setup(r => r.GetByEmail("notexist@homedecorshop.local")).Returns((User?)null);

        // Act
        var result = _userService.Login(input);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public void Login_EmailNotConfirmed_ThrowsRequestValidationException()
    {
        // Arrange
        var unconfirmedUser = new User
        {
            UserId = 2,
            Email = "unconfirmed@homedecorshop.local",
            FullName = "Unconfirmed User",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"),
            IsActive = true,
            IsEmailConfirmed = false,
            Addresses = new List<Address>()
        };

        var input = new LoginInput { Email = "unconfirmed@homedecorshop.local", Password = "Password123" };
        _mockRepo.Setup(r => r.GetByEmail("unconfirmed@homedecorshop.local")).Returns(unconfirmedUser);

        // Act & Assert
        var exception = Assert.Throws<RequestValidationException>(() => _userService.Login(input));
        Assert.Equal(AppErrorCodes.EmailNotConfirmed, exception.Code);
    }

    [Fact]
    public void Login_AccountLocked_ThrowsRequestValidationException()
    {
        // Arrange
        var lockedUser = new User
        {
            UserId = 3,
            Email = "locked@homedecorshop.local",
            FullName = "Locked User",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"),
            IsActive = false,
            IsEmailConfirmed = true,
            Addresses = new List<Address>()
        };

        var input = new LoginInput { Email = "locked@homedecorshop.local", Password = "Password123" };
        _mockRepo.Setup(r => r.GetByEmail("locked@homedecorshop.local")).Returns(lockedUser);

        // Act & Assert
        Assert.Throws<RequestValidationException>(() => _userService.Login(input));
    }

    [Fact]
    public void Login_Success_UpdatesTokenInRepository()
    {
        // Arrange
        var input = new LoginInput { Email = "admin1@homedecorshop.local", Password = "admin123" };
        _mockRepo.Setup(r => r.GetByEmail("admin1@homedecorshop.local")).Returns(_validUser);
        _mockRepo.Setup(r => r.Update(It.IsAny<User>())).Returns((User u) => u);

        // Act
        _userService.Login(input);

        // Assert
        _mockRepo.Verify(r => r.Update(It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public void Login_Success_GeneratesNewToken()
    {
        // Arrange
        var oldToken = _validUser.CurrentToken;
        var input = new LoginInput { Email = "admin1@homedecorshop.local", Password = "admin123" };
        _mockRepo.Setup(r => r.GetByEmail("admin1@homedecorshop.local")).Returns(_validUser);
        _mockRepo.Setup(r => r.Update(It.IsAny<User>())).Returns((User u) => u);

        // Act
        var result = _userService.Login(input);

        // Assert
        Assert.NotNull(result);
        Assert.NotEqual(oldToken, result!.Token);
    }

    [Fact]
    public void Login_EmailIsCaseInsensitive()
    {
        // Arrange
        var input = new LoginInput { Email = "  Admin1@HomeDecorShop.LOCAL  ", Password = "admin123" };
        _mockRepo.Setup(r => r.GetByEmail("admin1@homedecorshop.local")).Returns(_validUser);
        _mockRepo.Setup(r => r.Update(It.IsAny<User>())).Returns((User u) => u);

        // Act
        var result = _userService.Login(input);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("admin1@homedecorshop.local", result!.User.Email);
    }
}
