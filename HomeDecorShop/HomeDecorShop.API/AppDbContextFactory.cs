using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using HomeDecorShop.Infrastructure;

namespace HomeDecorShop.API;

public sealed class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseSqlServer("Server=localhost;Database=BeeShopDB;Trusted_Connection=True;TrustServerCertificate=True;");

        return new AppDbContext(optionsBuilder.Options);
    }
}
