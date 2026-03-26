namespace HomeDecorShop.Domain;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public bool IsActive { get; set; }

    public ICollection<Product> Products { get; set; } = new List<Product>();
}

// Chuyển thành Class cho EF Core
public class Product
{
    public int ProductId { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? OldPrice { get; set; }
    public int CategoryId { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public string HoverImage { get; set; } = string.Empty;
    public string? VideoUrl { get; set; }
    public string? Tag { get; set; }
    public int? SoldPercentage { get; set; }
    public int StockLeft { get; set; }
    public double Rating { get; set; }
    public int Reviews { get; set; }
    public string Brand { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Material { get; set; } = string.Empty;
    public string Style { get; set; } = string.Empty;
    public bool InStock { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Description { get; set; }

    public Category CategoryNavigation { get; set; } = null!;
}

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
    public bool IsEmailConfirmed { get; set; } = false;
    public string? EmailConfirmationToken { get; set; }
    public ICollection<Address> Addresses { get; set; } = new List<Address>();
}

public interface IEmailService
{
    void SendEmail(string to, string subject, string body);
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
