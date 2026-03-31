using Swashbuckle.AspNetCore.Annotations;

namespace HomeDecorShop.API;

internal static class SwaggerStartupExtensions
{
    public static IServiceCollection AddApiSwagger(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.EnableAnnotations();
            options.SupportNonNullableReferenceTypes();
        });

        return services;
    }
}
