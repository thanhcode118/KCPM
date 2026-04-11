using HomeDecorShop.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeDecorShop.API.Controllers;

[ApiController]
[Authorize]
[ApiExplorerSettings(IgnoreApi = true)]
[Route("api/users")]
[Produces("application/json")]
public sealed class LegacyAccountController(IUserService userService) : ControllerBase
{
    [HttpGet("me")]
    public IActionResult GetCurrentUser()
    {
        var user = userService.GetByToken(ReadToken());
        return Ok(user ?? throw new UnauthorizedException("Authentication token is invalid or has expired.", AppErrorCodes.AuthTokenInvalid));
    }

    [HttpPut("me")]
    public IActionResult UpdateCurrentUser([FromBody] UpdateProfileInput input)
    {
        var token = ReadToken();
        _ = userService.GetByToken(token) ?? throw new UnauthorizedException("Authentication token is invalid or has expired.", AppErrorCodes.AuthTokenInvalid);
        var user = userService.UpdateProfile(token, input);
        return Ok(user ?? throw new UnauthorizedException("Authentication token is invalid or has expired.", AppErrorCodes.AuthTokenInvalid));
    }

    [HttpPost("me/addresses")]
    public IActionResult AddCurrentUserAddress([FromBody] UpsertAddressInput input)
    {
        var token = ReadToken();
        _ = userService.GetByToken(token) ?? throw new UnauthorizedException("Authentication token is invalid or has expired.", AppErrorCodes.AuthTokenInvalid);
        _ = userService.AddAddress(token, input) ?? throw new UnauthorizedException("Authentication token is invalid or has expired.", AppErrorCodes.AuthTokenInvalid);
        var user = userService.GetByToken(token);
        return Ok(user ?? throw new UnauthorizedException("Authentication token is invalid or has expired.", AppErrorCodes.AuthTokenInvalid));
    }

    private string ReadToken() => AuthTokenReader.ReadToken(HttpContext);
}
