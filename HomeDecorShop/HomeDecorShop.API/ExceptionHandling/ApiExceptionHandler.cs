using HomeDecorShop.Application;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace HomeDecorShop.API.ExceptionHandling;

internal sealed class ApiExceptionHandler(
    ILogger<ApiExceptionHandler> logger,
    IProblemDetailsService problemDetailsService) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var problemDetails = CreateProblemDetails(httpContext, exception);
        httpContext.Response.StatusCode = problemDetails.Status ?? StatusCodes.Status500InternalServerError;

        if (problemDetails.Status >= 500)
        {
            logger.LogError(
                exception,
                "Unhandled exception for {Method} {Path} returned {StatusCode}.",
                httpContext.Request.Method,
                httpContext.Request.Path,
                problemDetails.Status);
        }
        else
        {
            logger.LogWarning(
                exception,
                "Handled exception for {Method} {Path} returned {StatusCode}.",
                httpContext.Request.Method,
                httpContext.Request.Path,
                problemDetails.Status);
        }

        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            ProblemDetails = problemDetails,
            Exception = exception
        });
    }

    private static ProblemDetails CreateProblemDetails(HttpContext httpContext, Exception exception)
    {
        if (exception is RequestValidationException validationException)
        {
            return new HttpValidationProblemDetails(validationException.Errors)
            {
                Title = validationException.Title,
                Detail = validationException.Message,
                Status = validationException.StatusCode,
                Type = validationException.Type,
                Instance = httpContext.Request.Path
            };
        }

        if (exception is AppException appException)
        {
            return new ProblemDetails
            {
                Title = appException.Title,
                Detail = appException.Message,
                Status = appException.StatusCode,
                Type = appException.Type,
                Instance = httpContext.Request.Path
            };
        }

        return new ProblemDetails
        {
            Title = "Internal server error",
            Detail = "An unexpected error occurred while processing the request.",
            Status = StatusCodes.Status500InternalServerError,
            Type = "https://httpstatuses.com/500",
            Instance = httpContext.Request.Path
        };
    }
}
