using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using HomeDecorShop.API.Controllers;
using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using System.Collections.Generic;

namespace HomeDecorShop.Tests;

public class UsersControllerTests
{
    private readonly Mock<IUserService> _mockUserService;
    private readonly UsersController _usersController;
    private readonly AddressesController _addressesController;
    private readonly AccountController _accountController;
    private readonly LegacyAccountController _legacyAccountController;

    public UsersControllerTests()
    {
        _mockUserService = new Mock<IUserService>();
        _usersController = new UsersController(_mockUserService.Object);
        _addressesController = new AddressesController(_mockUserService.Object);
        _accountController = new AccountController(_mockUserService.Object);
        _legacyAccountController = new LegacyAccountController(_mockUserService.Object);

        // Setup HttpContext with a test token
        var context = new DefaultHttpContext();
        context.Request.Headers["X-Auth-Token"] = "test-token";

        var controllerContext = new ControllerContext { HttpContext = context };
        _usersController.ControllerContext = controllerContext;
        _addressesController.ControllerContext = controllerContext;
        _accountController.ControllerContext = controllerContext;
        _legacyAccountController.ControllerContext = controllerContext;
    }

    [Fact]
    public void UsersGetAll_Success_ReturnsOkWithUsers()
    {
        // Arrange
        _mockUserService.Setup(s => s.GetAll()).Returns(Array.Empty<UserView>());

        // Act
        var response = _usersController.GetAll();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<UserView[]>(okResult.Value);
        Assert.Empty(returnedResult);
    }

    [Fact]
    public void UsersGetById_UserExists_ReturnsOkWithUser()
    {
        // Arrange
        var userView = new UserView(1, "test@example.com", "Nguyen Van A", "0123456789", "Customer", DateTime.UtcNow, true, Array.Empty<AddressView>());
        _mockUserService.Setup(s => s.GetById(1)).Returns(userView);

        // Act
        var response = _usersController.GetById(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<UserView>(okResult.Value);
        Assert.Equal("test@example.com", returnedResult.Email);
    }

    [Fact]
    public void UpdateUserRole_UserExists_ReturnsOk()
    {
        // Arrange
        var input = new UpdateUserRoleInput { Role = "admin" };
        _mockUserService.Setup(s => s.UpdateRole(1, UserRole.Admin)).Returns(true);

        // Act
        var response = _usersController.UpdateUserRole(1, input);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var msg = Assert.IsType<MessageResponse>(okResult.Value);
        Assert.Contains("quyen", msg.Message.ToLower());
    }

    [Fact]
    public void ToggleStatus_UserExists_ReturnsOk()
    {
        // Arrange
        _mockUserService.Setup(s => s.ToggleStatus(1)).Returns(true);

        // Act
        var response = _usersController.ToggleStatus(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var msg = Assert.IsType<MessageResponse>(okResult.Value);
        Assert.Contains("trang thai", msg.Message.ToLower());
    }

    [Fact]
    public void UsersDelete_UserExists_ReturnsNoContent()
    {
        // Arrange
        _mockUserService.Setup(s => s.Delete(1)).Returns(true);

        // Act
        var response = _usersController.Delete(1);

        // Assert
        Assert.IsType<NoContentResult>(response);
    }

    [Fact]
    public void AddressesGetAll_Success_ReturnsOkWithAddresses()
    {
        // Arrange
        var userView = new UserView(1, "test@example.com", "Nguyen Van A", "0123456789", "Customer", DateTime.UtcNow, true, Array.Empty<AddressView>());
        _mockUserService.Setup(s => s.GetByToken("test-token")).Returns(userView);
        _mockUserService.Setup(s => s.GetAddresses("test-token")).Returns(Array.Empty<AddressView>());

        // Act
        var response = _addressesController.GetAll();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<AddressView[]>(okResult.Value);
        Assert.Empty(returnedResult);
    }

    [Fact]
    public void AddressesGetById_AddressExists_ReturnsOkWithAddress()
    {
        // Arrange
        var userView = new UserView(1, "test@example.com", "Nguyen Van A", "0123456789", "Customer", DateTime.UtcNow, true, Array.Empty<AddressView>());
        var addressView = new AddressView(1, "Nguyen Van A", "0123456789", "Hanoi", "Ward 1", "District 1", "City 1", true);
        _mockUserService.Setup(s => s.GetByToken("test-token")).Returns(userView);
        _mockUserService.Setup(s => s.GetAddressById("test-token", 1)).Returns(addressView);

        // Act
        var response = _addressesController.GetById(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<AddressView>(okResult.Value);
        Assert.Equal("Hanoi", returnedResult.Line1);
    }

    [Fact]
    public void AddressesCreate_Success_ReturnsCreatedAtAction()
    {
        // Arrange
        var input = new UpsertAddressInput { FullName = "Nguyen Van A", Phone = "0123456789", Line1 = "Hanoi", Ward = "Ward 1", District = "District 1", City = "City 1", IsDefault = true };
        var userView = new UserView(1, "test@example.com", "Nguyen Van A", "0123456789", "Customer", DateTime.UtcNow, true, Array.Empty<AddressView>());
        var addressView = new AddressView(1, "Nguyen Van A", "0123456789", "Hanoi", "Ward 1", "District 1", "City 1", true);
        _mockUserService.Setup(s => s.GetByToken("test-token")).Returns(userView);
        _mockUserService.Setup(s => s.AddAddress("test-token", input)).Returns(addressView);

        // Act
        var response = _addressesController.Create(input);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(response.Result);
        var returnedResult = Assert.IsType<AddressView>(createdResult.Value);
        Assert.Equal(1, returnedResult.Id);
    }

    [Fact]
    public void AccountGetProfile_Success_ReturnsOkWithUser()
    {
        // Arrange
        var userView = new UserView(1, "test@example.com", "Nguyen Van A", "0123456789", "Customer", DateTime.UtcNow, true, Array.Empty<AddressView>());
        _mockUserService.Setup(s => s.GetByToken("test-token")).Returns(userView);

        // Act
        var response = _accountController.GetProfile();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<UserView>(okResult.Value);
        Assert.Equal("Nguyen Van A", returnedResult.FullName);
    }

    [Fact]
    public void AccountUpdateProfile_Success_ReturnsOkWithUser()
    {
        // Arrange
        var input = new UpdateProfileInput { FullName = "Nguyen Van B", Phone = "0987654321" };
        var userView = new UserView(1, "test@example.com", "Nguyen Van B", "0987654321", "Customer", DateTime.UtcNow, true, Array.Empty<AddressView>());
        _mockUserService.Setup(s => s.GetByToken("test-token")).Returns(userView);
        _mockUserService.Setup(s => s.UpdateProfile("test-token", input)).Returns(userView);

        // Act
        var response = _accountController.UpdateProfile(input);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response.Result);
        var returnedResult = Assert.IsType<UserView>(okResult.Value);
        Assert.Equal("Nguyen Van B", returnedResult.FullName);
    }

    [Fact]
    public void LegacyGetCurrentUser_Success_ReturnsOkWithUser()
    {
        // Arrange
        var userView = new UserView(1, "test@example.com", "Nguyen Van A", "0123456789", "Customer", DateTime.UtcNow, true, Array.Empty<AddressView>());
        _mockUserService.Setup(s => s.GetByToken("test-token")).Returns(userView);

        // Act
        var response = _legacyAccountController.GetCurrentUser();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(response);
        var returnedResult = Assert.IsType<UserView>(okResult.Value);
        Assert.Equal("test@example.com", returnedResult.Email);
    }
}
