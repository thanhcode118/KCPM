namespace HomeDecorShop.Domain;

public sealed record Product(
    int ProductId, string Sku, string ProductName, string Slug, decimal Price, decimal? OldPrice,
    int CategoryId, string Category, string Image, string HoverImage, string? VideoUrl,
    string? Tag, int? SoldPercentage, int StockLeft, double Rating, int Reviews,
    string Brand, string Color, string Material, string Style, bool InStock,
    bool IsActive, bool IsPromotion, DateTime CreatedAt, string? Description = null);

public enum UserRole
{
    Admin,
    Customer
}

// Chuyển thành Class cho EF Core
public class Address
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Line1 { get; set; } = string.Empty;
    public string Ward { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    
    public User User { get; set; } = null!;
}

// Chuyển thành Class cho EF Core
public class User
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string? CurrentToken { get; set; }
}

public interface IProductRepository
{
    IReadOnlyCollection<Product> GetAll();
    Product? GetById(int productId);
    Product Create(Product product);
    Product? Update(Product product);
    bool Delete(int productId);
}

public interface IUserRepository
{
    IReadOnlyCollection<User> GetAll();
    User? GetById(int userId);
    User? GetByEmail(string email);
    User? GetByToken(string token);
    User Create(User user);
    User? Update(User user);
}

public sealed record Feedback(
    int FeedbackId,
    string Name,
    string Email,
    string Message,
    DateTime CreatedAt);

public interface IFeedbackRepository
{
    IReadOnlyCollection<Feedback> GetAll();
    Feedback Create(Feedback feedback);
}
