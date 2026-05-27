using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using HomeDecorShop.API.Controllers;
using HomeDecorShop.Application;
using System.Collections.Generic;

namespace HomeDecorShop.Tests;

public class AuthControllerTests
{
    private readonly Mock<IUserService> _mockUserService;
    private readonly AuthController _authController;
    private readonly LegacyAuthController _legacyAuthController;

    public AuthControllerTests()
    {
        _mockUserService = new Mock<IUserService>();
        _authController = new AuthController(_mockUserService.Object);
        _legacyAuthController = new LegacyAuthController(_mockUserService.Object);
    }

    [Fact]
    public void Register_Success_ReturnsOkWithAuthResult()
    {
        // Arrange
        var input = new RegisterUserInput 
        { 
            Email = "test@example.com", 
            Password = "Password123", 
            FullName = "Nguyen Van A", 
            Phone = "0123456789", 
            Role = "customer" 
        };
        var userView = new UserView(1, "test@example.com", "Nguyen Van A", "0123456789", "Customer", DateTime.UtcNow, true, Array.Empty<AddressView>());
        var authResult = new AuthResult("token-abc", userView);

        _mockUserService.Setup(s => s.Register(input)).Returns(authResult);

        // Act
        var response = _authController.Register(input);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<AuthResult>(okResult.Value);
        Assert.Equal("token-abc", returnedResult.Token);
        Assert.Equal("test@example.com", returnedResult.User.Email);
    }

    [Fact]
    public void Login_Success_ReturnsOkWithAuthResult()
    {
        // Arrange
        var input = new LoginInput { Email = "test@example.com", Password = "Password123" };
        var userView = new UserView(1, "test@example.com", "Nguyen Van A", "0123456789", "Customer", DateTime.UtcNow, true, Array.Empty<AddressView>());
        var authResult = new AuthResult("token-abc", userView);

        _mockUserService.Setup(s => s.Login(input)).Returns(authResult);

        // Act
        var response = _authController.Login(input);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<AuthResult>(okResult.Value);
        Assert.Equal("token-abc", returnedResult.Token);
    }

    [Fact]
    public void Login_Failure_ThrowsUnauthorizedException()
    {
        // Arrange
        var input = new LoginInput { Email = "test@example.com", Password = "WrongPassword" };
        _mockUserService.Setup(s => s.Login(input)).Returns((AuthResult?)null);

        // Act & Assert
        var exception = Assert.Throws<UnauthorizedException>(() => _authController.Login(input));
        Assert.Equal(AppErrorCodes.InvalidCredentials, exception.Code);
    }

    [Fact]
    public void ConfirmEmail_Success_ReturnsOk()
    {
        // Arrange
        var token = "valid-token";
        _mockUserService.Setup(s => s.ConfirmEmail(token)).Returns(true);

        // Act
        var response = _authController.ConfirmEmail(token);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var msgResponse = Assert.IsType<MessageResponse>(okResult.Value);
        Assert.Contains("email", msgResponse.Message.ToLower());
    }

    [Fact]
    public void ConfirmEmail_Failure_ThrowsRequestValidationException()
    {
        // Arrange
        var token = "invalid-token";
        _mockUserService.Setup(s => s.ConfirmEmail(token)).Returns(false);

        // Act & Assert
        var exception = Assert.Throws<RequestValidationException>(() => _authController.ConfirmEmail(token));
        Assert.Equal(AppErrorCodes.EmailConfirmationTokenInvalid, exception.Code);
    }

    [Fact]
    public void LegacyRegister_Success_ReturnsOk()
    {
        // Arrange
        var input = new RegisterUserInput 
        { 
            Email = "test@example.com", 
            Password = "Password123", 
            FullName = "Nguyen Van A", 
            Phone = "0123456789", 
            Role = "customer" 
        };
        var userView = new UserView(1, "test@example.com", "Nguyen Van A", "0123456789", "Customer", DateTime.UtcNow, true, Array.Empty<AddressView>());
        var authResult = new AuthResult("token-abc", userView);

        _mockUserService.Setup(s => s.Register(input)).Returns(authResult);

        // Act
        var response = _legacyAuthController.Register(input);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response);
        var returnedResult = Assert.IsType<AuthResult>(okResult.Value);
        Assert.Equal("token-abc", returnedResult.Token);
    }

    [Fact]
    public void LegacyLogin_Success_ReturnsOk()
    {
        // Arrange
        var input = new LoginInput { Email = "test@example.com", Password = "Password123" };
        var userView = new UserView(1, "test@example.com", "Nguyen Van A", "0123456789", "Customer", DateTime.UtcNow, true, Array.Empty<AddressView>());
        var authResult = new AuthResult("token-abc", userView);

        _mockUserService.Setup(s => s.Login(input)).Returns(authResult);

        // Act
        var response = _legacyAuthController.Login(input);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response);
        var returnedResult = Assert.IsType<AuthResult>(okResult.Value);
        Assert.Equal("token-abc", returnedResult.Token);
    }

    [Fact]
    public void LegacyConfirmEmail_Success_ReturnsOk()
    {
        // Arrange
        var token = "valid-token";
        _mockUserService.Setup(s => s.ConfirmEmail(token)).Returns(true);

        // Act
        var response = _legacyAuthController.ConfirmEmail(token);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response);
        var msgResponse = Assert.IsType<MessageResponse>(okResult.Value);
        Assert.Contains("email", msgResponse.Message.ToLower());
    }

    [Fact]
    public void LegacyLogin_Failure_ThrowsUnauthorizedException()
    {
        // Arrange
        var input = new LoginInput { Email = "test@example.com", Password = "WrongPassword" };
        _mockUserService.Setup(s => s.Login(input)).Returns((AuthResult?)null);

        // Act & Assert
        var exception = Assert.Throws<UnauthorizedException>(() => _legacyAuthController.Login(input));
        Assert.Equal(AppErrorCodes.InvalidCredentials, exception.Code);
    }
}
