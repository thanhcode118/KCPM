using Xunit;
using Moq;
using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using System.Collections.Generic;

namespace HomeDecorShop.Tests;

/// <summary>
/// HOM-2: Unit tests cho UserService - Register
/// </summary>
public class UserServiceRegisterTests
{
    private readonly Mock<IUserRepository> _mockRepo;
    private readonly Mock<IEmailService> _mockEmail;
    private readonly UserService _userService;

    public UserServiceRegisterTests()
    {
        _mockRepo = new Mock<IUserRepository>();
        _mockEmail = new Mock<IEmailService>();
        _userService = new UserService(_mockRepo.Object, _mockEmail.Object);
    }

    [Fact]
    public void Register_Success_ReturnsAuthResultWithToken()
    {
        // Arrange
        var input = new RegisterUserInput
        {
            Email = "newuser@homedecorshop.local",
            FullName = "Nguyen Van A",
            Phone = "0987654321",
            Password = "Password123",
            Role = "customer"
        };

        _mockRepo.Setup(r => r.GetByEmail("newuser@homedecorshop.local")).Returns((User?)null);
        _mockRepo.Setup(r => r.Create(It.IsAny<User>())).Returns((User u) => u);

        // Act
        var result = _userService.Register(input);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.Token);
        Assert.NotEmpty(result.Token);
        Assert.Equal("newuser@homedecorshop.local", result.User.Email);
        Assert.Equal("Nguyen Van A", result.User.FullName);
    }

    [Fact]
    public void Register_DuplicateEmail_ThrowsConflictException()
    {
        // Arrange
        var existingUser = new User
        {
            UserId = 1,
            Email = "admin1@homedecorshop.local",
            FullName = "Admin",
            PasswordHash = "hash",
            Role = UserRole.Admin,
            IsActive = true,
            Addresses = new List<Address>()
        };

        var input = new RegisterUserInput
        {
            Email = "admin1@homedecorshop.local",
            FullName = "Test Duplicate Admin",
            Phone = "0123456789",
            Password = "Password123",
            Role = "customer"
        };

        _mockRepo.Setup(r => r.GetByEmail("admin1@homedecorshop.local")).Returns(existingUser);

        // Act & Assert
        var exception = Assert.Throws<ConflictException>(() => _userService.Register(input));
        Assert.Equal(AppErrorCodes.EmailAlreadyExists, exception.Code);
    }

    [Fact]
    public void Register_EmailIsNormalized_ToLowerCase()
    {
        // Arrange
        var input = new RegisterUserInput
        {
            Email = "  UserMixed@Example.COM  ",
            FullName = "Test User",
            Phone = "0987654321",
            Password = "Password123",
            Role = "customer"
        };

        _mockRepo.Setup(r => r.GetByEmail("usermixed@example.com")).Returns((User?)null);
        _mockRepo.Setup(r => r.Create(It.IsAny<User>())).Returns((User u) => u);

        // Act
        var result = _userService.Register(input);

        // Assert
        Assert.Equal("usermixed@example.com", result.User.Email);
    }

    [Fact]
    public void Register_PasswordIsHashed_NotStoredInPlainText()
    {
        // Arrange
        var input = new RegisterUserInput
        {
            Email = "hash_test@example.com",
            FullName = "Hash Test",
            Phone = "0987654321",
            Password = "Password123",
            Role = "customer"
        };

        User? capturedUser = null;
        _mockRepo.Setup(r => r.GetByEmail("hash_test@example.com")).Returns((User?)null);
        _mockRepo.Setup(r => r.Create(It.IsAny<User>()))
            .Callback<User>(u => capturedUser = u)
            .Returns((User u) => u);

        // Act
        _userService.Register(input);

        // Assert
        Assert.NotNull(capturedUser);
        Assert.NotEqual("Password123", capturedUser!.PasswordHash);
        Assert.True(BCrypt.Net.BCrypt.Verify("Password123", capturedUser.PasswordHash));
    }

    [Fact]
    public void Register_NewUser_HasCustomerRole()
    {
        // Arrange
        var input = new RegisterUserInput
        {
            Email = "role_test@example.com",
            FullName = "Role Test",
            Phone = "0987654321",
            Password = "Password123",
            Role = "customer"
        };

        _mockRepo.Setup(r => r.GetByEmail("role_test@example.com")).Returns((User?)null);
        _mockRepo.Setup(r => r.Create(It.IsAny<User>())).Returns((User u) => u);

        // Act
        var result = _userService.Register(input);

        // Assert
        Assert.Equal("customer", result.User.Role);
    }

    [Fact]
    public void Register_Success_RepositoryCreateCalledOnce()
    {
        // Arrange
        var input = new RegisterUserInput
        {
            Email = "verify_call@example.com",
            FullName = "Verify Call",
            Phone = "0987654321",
            Password = "Password123",
            Role = "customer"
        };

        _mockRepo.Setup(r => r.GetByEmail("verify_call@example.com")).Returns((User?)null);
        _mockRepo.Setup(r => r.Create(It.IsAny<User>())).Returns((User u) => u);

        // Act
        _userService.Register(input);

        // Assert
        _mockRepo.Verify(r => r.Create(It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public void Register_FullNameIsTrimmed()
    {
        // Arrange
        var input = new RegisterUserInput
        {
            Email = "trim_test@example.com",
            FullName = "  Nguyen Van B  ",
            Phone = "0987654321",
            Password = "Password123",
            Role = "customer"
        };

        _mockRepo.Setup(r => r.GetByEmail("trim_test@example.com")).Returns((User?)null);
        _mockRepo.Setup(r => r.Create(It.IsAny<User>())).Returns((User u) => u);

        // Act
        var result = _userService.Register(input);

        // Assert
        Assert.Equal("Nguyen Van B", result.User.FullName);
    }
}
