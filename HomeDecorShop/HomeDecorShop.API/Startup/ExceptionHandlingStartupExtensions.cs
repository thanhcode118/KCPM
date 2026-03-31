using HomeDecorShop.API.ExceptionHandling;
using Microsoft.AspNetCore.Mvc;

namespace HomeDecorShop.API;

internal static class ExceptionHandlingStartupExtensions
{
    public static IServiceCollection AddApiExceptionHandling(this IServiceCollection services)
    {
        services.AddProblemDetails(options =>
        {
            options.CustomizeProblemDetails = context =>
            {
                context.ProblemDetails.Instance ??= context.HttpContext.Request.Path;
                context.ProblemDetails.Extensions["traceId"] = context.HttpContext.TraceIdentifier;
            };
        });

        services.AddExceptionHandler<ApiExceptionHandler>();

        return services;
    }

    public static IMvcBuilder AddApiControllers(this IServiceCollection services)
    {
        return services
            .AddControllers()
            .ConfigureApiBehaviorOptions(options =>
            {
                options.InvalidModelStateResponseFactory = context =>
                {
                    var problemDetails = new ValidationProblemDetails(context.ModelState)
                    {
                        Title = "Validation failed",
                        Detail = "One or more request fields are invalid.",
                        Status = StatusCodes.Status400BadRequest,
                        Type = "https://httpstatuses.com/400",
                        Instance = context.HttpContext.Request.Path
                    };
                    problemDetails.Extensions["traceId"] = context.HttpContext.TraceIdentifier;

                    return new BadRequestObjectResult(problemDetails);
                };
            });
    }
}
