using Xunit;
using HomeDecorShop.Domain;
using HomeDecorShop.Application;

namespace HomeDecorShop.Tests;

public class AuthTests
{
    [Fact]
    public void User_Initialization_ShouldSetPropertiesCorrectly()
    {
        // Arrange
        var user = new User
        {
            UserId = 1,
            Email = "test@example.com",
            FullName = "Nguyen Van A",
            Role = UserRole.Customer,
            IsActive = true,
            IsEmailConfirmed = false
        };

        // Act & Assert
        Assert.Equal(1, user.UserId);
        Assert.Equal("test@example.com", user.Email);
        Assert.Equal("Nguyen Van A", user.FullName);
        Assert.Equal(UserRole.Customer, user.Role);
        Assert.True(user.IsActive);
        Assert.False(user.IsEmailConfirmed);
    }

    [Fact]
    public void MockUserService_Login_ShouldReturnToken_WhenCredentialsAreValid()
    {
        // Arrange
        var mockUserService = new MockUserService();
        var loginInput = new LoginInput { Email = "test@example.com", Password = "Password123" };

        // Act
        var result = mockUserService.Login(loginInput);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("mock-token-12345", result.Token);
        Assert.Equal("test@example.com", result.User.Email);
    }
}

// A simple mock for verification without requiring external libraries
public class MockUserService : IUserService
{
    public IReadOnlyCollection<UserView> GetAll() => throw new NotImplementedException();
    public UserView? GetById(int userId) => throw new NotImplementedException();
    public AuthResult Register(RegisterUserInput input) => throw new NotImplementedException();

    public AuthResult? Login(LoginInput input)
    {
        if (input.Email == "test@example.com" && input.Password == "Password123")
        {
            var userView = new UserView(1, "test@example.com", "Nguyen Van A", "0123456789", "Customer", DateTime.UtcNow, true, Array.Empty<AddressView>());
            return new AuthResult("mock-token-12345", userView);
        }
        return null;
    }

    public UserView? GetByToken(string token) => throw new NotImplementedException();
    public UserView? UpdateProfile(string token, UpdateProfileInput input) => throw new NotImplementedException();
    public IReadOnlyCollection<AddressView>? GetAddresses(string token) => throw new NotImplementedException();
    public AddressView? GetAddressById(string token, int addressId) => throw new NotImplementedException();
    public AddressView? AddAddress(string token, UpsertAddressInput input) => throw new NotImplementedException();
    public AddressView? UpdateAddress(string token, int addressId, UpsertAddressInput input) => throw new NotImplementedException();
    public bool DeleteAddress(string token, int addressId) => throw new NotImplementedException();
    public bool ConfirmEmail(string token) => throw new NotImplementedException();
    public bool UpdateRole(int userId, UserRole role) => throw new NotImplementedException();
    public bool ToggleStatus(int userId) => throw new NotImplementedException();
    public bool Delete(int userId) => throw new NotImplementedException();
}
