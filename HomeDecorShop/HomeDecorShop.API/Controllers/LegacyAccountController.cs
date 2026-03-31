using HomeDecorShop.Application;
using Microsoft.AspNetCore.Mvc;

namespace HomeDecorShop.API.Controllers;

[ApiController]
[ApiExplorerSettings(IgnoreApi = true)]
[Route("api/users")]
[Produces("application/json")]
public sealed class LegacyAccountController(IUserService userService) : ControllerBase
{
    [HttpGet("me")]
    public IActionResult GetCurrentUser()
    {
        var user = userService.GetByToken(ReadToken());
        return Ok(user ?? throw new UnauthorizedException("Authentication token is invalid or has expired."));
    }

    [HttpPut("me")]
    public IActionResult UpdateCurrentUser([FromBody] UpdateProfileInput input)
    {
        var token = ReadToken();
        _ = userService.GetByToken(token) ?? throw new UnauthorizedException("Authentication token is invalid or has expired.");
        var user = userService.UpdateProfile(token, input);
        return Ok(user ?? throw new UnauthorizedException("Authentication token is invalid or has expired."));
    }

    [HttpPost("me/addresses")]
    public IActionResult AddCurrentUserAddress([FromBody] UpsertAddressInput input)
    {
        var token = ReadToken();
        _ = userService.GetByToken(token) ?? throw new UnauthorizedException("Authentication token is invalid or has expired.");
        _ = userService.AddAddress(token, input) ?? throw new UnauthorizedException("Authentication token is invalid or has expired.");
        var user = userService.GetByToken(token);
        return Ok(user ?? throw new UnauthorizedException("Authentication token is invalid or has expired."));
    }

    private string ReadToken() => AuthTokenReader.ReadToken(HttpContext);
}
