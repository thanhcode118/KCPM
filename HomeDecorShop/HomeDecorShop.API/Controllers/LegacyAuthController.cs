using HomeDecorShop.Application;
using Microsoft.AspNetCore.Mvc;

namespace HomeDecorShop.API.Controllers;

[ApiController]
[ApiExplorerSettings(IgnoreApi = true)]
[Route("api/users")]
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
        return Ok(auth ?? throw new UnauthorizedException("Email or password is incorrect."));
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
                });
        }

        return Ok(new MessageResponse("Xac nhan email thanh cong."));
    }
}
