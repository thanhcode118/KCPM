using HomeDecorShop.Application.Feedbacks;
using Microsoft.Extensions.DependencyInjection;

namespace HomeDecorShop.Application;

public static class ApplicationDependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IFeedbackService, FeedbackService>();
        services.AddScoped<CreateFeedbackHandler>();
        services.AddScoped<GetFeedbacksHandler>();
        return services;
    }
}
