using HomeDecorShop.Application;
using Microsoft.Extensions.DependencyInjection;

namespace HomeDecorShop.Infrastructure;

public static class InfrastructureDependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IProductRepository, SqlProductRepository>();
        services.AddScoped<IUserRepository, SqlUserRepository>();
        services.AddScoped<IFeedbackRepository, SqlFeedbackRepository>();
        services.AddScoped<ICategoryRepository, SqlCategoryRepository>();
        services.AddScoped<IEmailService, EmailService>();
        return services;
    }
}
