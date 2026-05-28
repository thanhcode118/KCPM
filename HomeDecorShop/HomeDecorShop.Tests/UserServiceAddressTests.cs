using Xunit;
using Moq;
using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using System.Collections.Generic;
using System.Linq;

namespace HomeDecorShop.Tests;

/// <summary>
/// HOM-4: Unit tests cho UserService - Address
/// </summary>
public class UserServiceAddressTests
{
    private readonly Mock<IUserRepository> _mockRepo;
    private readonly Mock<IEmailService> _mockEmail;
    private readonly UserService _userService;

    private readonly User _userWithAddresses;
    private const string ValidToken = "valid-token-123";

    public UserServiceAddressTests()
    {
        _mockRepo = new Mock<IUserRepository>();
        _mockEmail = new Mock<IEmailService>();
        _userService = new UserService(_mockRepo.Object, _mockEmail.Object);

        _userWithAddresses = new User
        {
            UserId = 1,
            Email = "customer@homedecorshop.local",
            FullName = "Nguyen Van A",
            Phone = "0987654321",
            Role = UserRole.Customer,
            PasswordHash = "hash",
            IsActive = true,
            IsEmailConfirmed = true,
            CurrentToken = ValidToken,
            Addresses = new List<Address>
            {
                new Address
                {
                    Id = 1,
                    UserId = 1,
                    FullName = "Nguyen Van A",
                    Phone = "0987654321",
                    Line1 = "123 Le Loi",
                    Ward = "Phuong 1",
                    District = "Quan 1",
                    City = "TP HCM",
                    IsDefault = true
                },
                new Address
                {
                    Id = 2,
                    UserId = 1,
                    FullName = "Nguyen Van A",
                    Phone = "0987654321",
                    Line1 = "456 Nguyen Hue",
                    Ward = "Phuong 2",
                    District = "Quan 3",
                    City = "TP HCM",
                    IsDefault = false
                }
            }
        };
    }

    // --- GetAddresses ---

    [Fact]
    public void GetAddresses_ValidToken_ReturnsAddressList()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetByToken(ValidToken)).Returns(_userWithAddresses);

        // Act
        var result = _userService.GetAddresses(ValidToken);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result!.Count);
    }

    [Fact]
    public void GetAddresses_InvalidToken_ReturnsNull()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetByToken("invalid-token")).Returns((User?)null);

        // Act
        var result = _userService.GetAddresses("invalid-token");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public void GetAddresses_DefaultAddressFirst()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetByToken(ValidToken)).Returns(_userWithAddresses);

        // Act
        var result = _userService.GetAddresses(ValidToken);

        // Assert
        Assert.NotNull(result);
        Assert.True(result!.First().IsDefault);
    }

    // --- GetAddressById ---

    [Fact]
    public void GetAddressById_AddressExists_ReturnsAddress()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetByToken(ValidToken)).Returns(_userWithAddresses);

        // Act
        var result = _userService.GetAddressById(ValidToken, 1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result!.Id);
        Assert.Equal("123 Le Loi", result.Line1);
    }

    [Fact]
    public void GetAddressById_AddressNotExists_ReturnsNull()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetByToken(ValidToken)).Returns(_userWithAddresses);

        // Act
        var result = _userService.GetAddressById(ValidToken, 999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public void GetAddressById_InvalidToken_ReturnsNull()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetByToken("bad-token")).Returns((User?)null);

        // Act
        var result = _userService.GetAddressById("bad-token", 1);

        // Assert
        Assert.Null(result);
    }

    // --- AddAddress ---

    [Fact]
    public void AddAddress_Success_ReturnsNewAddress()
    {
        // Arrange
        var input = new UpsertAddressInput
        {
            FullName = "Tran Van B",
            Phone = "0912345678",
            Line1 = "789 Tran Hung Dao",
            Ward = "Phuong 5",
            District = "Quan 5",
            City = "TP HCM",
            IsDefault = false
        };

        _mockRepo.Setup(r => r.GetByToken(ValidToken)).Returns(_userWithAddresses);
        _mockRepo.Setup(r => r.Update(It.IsAny<User>())).Returns((User u) =>
        {
            // Simulate DB assigning a new Id to the added address
            var newAddr = u.Addresses.FirstOrDefault(a => a.Id == 0);
            if (newAddr != null) newAddr.Id = 100;
            return u;
        });

        // Act
        var result = _userService.AddAddress(ValidToken, input);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Tran Van B", result!.FullName);
        Assert.Equal("789 Tran Hung Dao", result.Line1);
    }

    [Fact]
    public void AddAddress_SetAsDefault_ResetsOtherDefaults()
    {
        // Arrange
        var input = new UpsertAddressInput
        {
            FullName = "New Default",
            Phone = "0912345678",
            Line1 = "New Address",
            Ward = "Ward",
            District = "District",
            City = "City",
            IsDefault = true
        };

        _mockRepo.Setup(r => r.GetByToken(ValidToken)).Returns(_userWithAddresses);
        _mockRepo.Setup(r => r.Update(It.IsAny<User>())).Returns((User u) => u);

        // Act
        _userService.AddAddress(ValidToken, input);

        // Assert - Existing default address should be reset
        var oldDefault = _userWithAddresses.Addresses.First(a => a.Id == 1);
        Assert.False(oldDefault.IsDefault);
    }

    [Fact]
    public void AddAddress_InvalidToken_ReturnsNull()
    {
        // Arrange
        var input = new UpsertAddressInput
        {
            FullName = "Test",
            Phone = "0912345678",
            Line1 = "Test",
            Ward = "Test",
            District = "Test",
            City = "Test",
            IsDefault = false
        };
        _mockRepo.Setup(r => r.GetByToken("invalid")).Returns((User?)null);

        // Act
        var result = _userService.AddAddress("invalid", input);

        // Assert
        Assert.Null(result);
    }

    // --- UpdateAddress ---

    [Fact]
    public void UpdateAddress_Success_ReturnsUpdatedAddress()
    {
        // Arrange
        var input = new UpsertAddressInput
        {
            FullName = "Updated Name",
            Phone = "0999888777",
            Line1 = "Updated Line1",
            Ward = "Updated Ward",
            District = "Updated District",
            City = "Updated City",
            IsDefault = false
        };

        _mockRepo.Setup(r => r.GetByToken(ValidToken)).Returns(_userWithAddresses);
        _mockRepo.Setup(r => r.Update(It.IsAny<User>())).Returns((User u) => u);

        // Act
        var result = _userService.UpdateAddress(ValidToken, 1, input);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Updated Name", result!.FullName);
        Assert.Equal("Updated Line1", result.Line1);
    }

    [Fact]
    public void UpdateAddress_AddressNotFound_ReturnsNull()
    {
        // Arrange
        var input = new UpsertAddressInput
        {
            FullName = "Test",
            Phone = "0912345678",
            Line1 = "Test",
            Ward = "Test",
            District = "Test",
            City = "Test",
            IsDefault = false
        };

        _mockRepo.Setup(r => r.GetByToken(ValidToken)).Returns(_userWithAddresses);

        // Act
        var result = _userService.UpdateAddress(ValidToken, 999, input);

        // Assert
        Assert.Null(result);
    }

    // --- DeleteAddress ---

    [Fact]
    public void DeleteAddress_Success_ReturnsTrue()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetByToken(ValidToken)).Returns(_userWithAddresses);
        _mockRepo.Setup(r => r.Update(It.IsAny<User>())).Returns((User u) => u);

        // Act
        var result = _userService.DeleteAddress(ValidToken, 2);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void DeleteAddress_AddressNotFound_ReturnsFalse()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetByToken(ValidToken)).Returns(_userWithAddresses);

        // Act
        var result = _userService.DeleteAddress(ValidToken, 999);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void DeleteAddress_InvalidToken_ReturnsFalse()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetByToken("bad-token")).Returns((User?)null);

        // Act
        var result = _userService.DeleteAddress("bad-token", 1);

        // Assert
        Assert.False(result);
    }
}
