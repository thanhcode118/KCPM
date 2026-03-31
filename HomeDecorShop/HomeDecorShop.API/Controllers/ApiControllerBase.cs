using HomeDecorShop.Application;
using Microsoft.AspNetCore.Mvc;

namespace HomeDecorShop.API.Controllers;

[Produces("application/json")]
public abstract class ApiControllerBase : ControllerBase
{
    protected string ReadRequiredToken()
    {
        var token = AuthTokenReader.ReadToken(HttpContext);
        if (string.IsNullOrWhiteSpace(token))
        {
            throw new UnauthorizedException("Authentication token is required.");
        }

        return token;
    }

    protected static T RequireResource<T>(T? resource, string message) where T : class =>
        resource ?? throw new NotFoundException(message);

    protected static void EnsureResourceExists(bool exists, string message)
    {
        if (!exists)
        {
            throw new NotFoundException(message);
        }
    }
}
