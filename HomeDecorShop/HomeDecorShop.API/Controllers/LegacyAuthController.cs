using HomeDecorShop.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeDecorShop.API.Controllers;

[ApiController]
[AllowAnonymous]
[ApiExplorerSettings(IgnoreApi = true)]
[Route("api/users")]
[Produces("application/json")]
public sealed class LegacyAuthController(IUserService userService) : ControllerBase
{
    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterUserInput input)
    {
        return Ok(userService.Register(input));
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginInput input)
    {
        var auth = userService.Login(input);
        return Ok(auth ?? throw new UnauthorizedException("Email or password is incorrect.", AppErrorCodes.InvalidCredentials));
    }

    [HttpGet("confirm-email")]
    public IActionResult ConfirmEmail([FromQuery] string token)
    {
        if (!userService.ConfirmEmail(token))
        {
            throw new RequestValidationException(
                "Email confirmation token is invalid or has expired.",
                new Dictionary<string, string[]>
                {
                    ["token"] = ["Email confirmation token is invalid or has expired."]
                },
                AppErrorCodes.EmailConfirmationTokenInvalid);
        }

        return Ok(new MessageResponse("Xac nhan email thanh cong."));
    }
}
