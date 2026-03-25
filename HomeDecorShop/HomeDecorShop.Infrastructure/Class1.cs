using System.Globalization;
using HomeDecorShop.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace HomeDecorShop.Infrastructure;

// --- GIỮ LẠI IN-MEMORY CỦA PRODUCT ---
// --- TẠO REPOSITORY MỚI DÙNG EF CORE ---
public sealed class SqlProductRepository : IProductRepository
{
    private readonly AppDbContext _context;

    public SqlProductRepository(AppDbContext context)
    {
        _context = context;
    }

    public IReadOnlyCollection<Product> GetAll() => _context.Products.ToList();

    public Product? GetById(int productId) => _context.Products.FirstOrDefault(p => p.ProductId == productId);

    public Product Create(Product product)
    {
        _context.Products.Add(product);
        _context.SaveChanges();
        return product;
    }

    public Product? Update(Product product)
    {
        _context.Products.Update(product);
        _context.SaveChanges();
        return product;
    }

    public bool Delete(int productId)
    {
        var product = _context.Products.Find(productId);
        if (product == null) return false;
        _context.Products.Remove(product);
        _context.SaveChanges();
        return true;
    }
}

// --- THÊM DB CONTEXT CHO EF CORE ---
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Feedback> Feedbacks => Set<Feedback>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasKey(u => u.UserId);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Feedback>()
            .ToTable("Feedback")
            .HasKey(f => f.FeedbackId);

        modelBuilder.Entity<Product>()
            .ToTable("Products")
            .HasKey(p => p.ProductId);

        modelBuilder.Entity<User>().HasData(new User
        {
            UserId = 99,
            Email = "admin@gmail.com",
            FullName = "Administrator",
            Phone = "0000000000",
            Address = "System",
            Role = UserRole.Admin,
            PasswordHash = "$2a$11$XZKAs1.hhd1cRoCH2eTlquOBAAEoA/Cfkt028hduwkCKNQ4eHd5bC",
            CreatedAt = new DateTime(2026, 3, 24, 15, 53, 10, DateTimeKind.Utc),
            IsEmailConfirmed = true
        });
    }
}

// --- TẠO REPOSITORY MỚI DÙNG EF CORE ---
public sealed class SqlUserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public SqlUserRepository(AppDbContext context)
    {
        _context = context;
    }

    public IReadOnlyCollection<User> GetAll()
    {
        return _context.Users.ToList();
    }

    public User? GetById(int id)
    {
        return _context.Users.FirstOrDefault(u => u.UserId == id);
    }

    public User? GetByEmail(string email)
    {
        return _context.Users.FirstOrDefault(u => u.Email == email.ToLower());
    }

    public User? GetByToken(string token)
    {
        return _context.Users.FirstOrDefault(u => u.CurrentToken == token);
    }

    public User Create(User user)
    {
        user.Email = user.Email.ToLower();
        _context.Users.Add(user);
        _context.SaveChanges();
        return user;
    }

    public User? Update(User user)
    {
        _context.Users.Update(user);
        _context.SaveChanges();
        return user;
    }
}

public sealed class SqlFeedbackRepository : IFeedbackRepository
{
    private readonly AppDbContext _context;

    public SqlFeedbackRepository(AppDbContext context)
    {
        _context = context;
    }

    public IReadOnlyCollection<Feedback> GetAll()
    {
        return _context.Feedbacks.OrderByDescending(f => f.CreatedAt).ToList();
    }

    public Feedback Create(Feedback feedback)
    {
        _context.Feedbacks.Add(feedback);
        _context.SaveChanges();
        return feedback;
    }
}

// --- CẬP NHẬT DEPENDENCY INJECTION ---
public static class InfrastructureDependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IProductRepository, SqlProductRepository>();
        
        // Đổi từ Singleton InMemory sang Scoped cho EF Core
        services.AddScoped<IUserRepository, SqlUserRepository>(); 
        services.AddScoped<IFeedbackRepository, SqlFeedbackRepository>();
        services.AddScoped<IEmailService, EmailService>();
        return services;
    }
}
