using System.Globalization;
using HomeDecorShop.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace HomeDecorShop.Infrastructure;


public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique(); // Ràng buộc Email duy nhất

        modelBuilder.Entity<User>()
            .HasMany(u => u.Addresses)
            .WithOne(a => a.User)
            .HasForeignKey(a => a.UserId);

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.Slug).IsRequired();
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Sku).IsRequired();
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.Slug).IsRequired();
            entity.Property(e => e.Price).HasPrecision(18, 2);
            entity.Property(e => e.OriginalPrice).HasPrecision(18, 2);

            entity.HasOne(d => d.CategoryNavigation)
                .WithMany(p => p.Products)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        var now = new DateTime(2026, 3, 13, 0, 0, 0, DateTimeKind.Utc);

        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Slug = "phu-kien-ban", Name = "Phụ kiện bàn", IsActive = true },
            new Category { Id = 2, Slug = "lighting", Name = "Lighting", IsActive = true },
            new Category { Id = 3, Slug = "decor", Name = "Decor", IsActive = true },
            new Category { Id = 4, Slug = "furniture", Name = "Furniture", IsActive = true },
            new Category { Id = 5, Slug = "textile", Name = "Textile", IsActive = true },
            new Category { Id = 6, Slug = "kitchen", Name = "Kitchen", IsActive = true }
        );

        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 101, Sku = "BEE-101", Slug = "khay-cam-but-go-soi", Name = "Khay Cắm Bút Gỗ Sồi", Price = 150000, OriginalPrice = 180000, CategoryId = 1, Category = "Phụ kiện bàn", Image = "https://picsum.photos/id/101/400/500", HoverImage = "https://picsum.photos/id/102/400/500", Tag = "NEW", Rating = 4.8, Reviews = 45, Color = "#8B4513", Material = "Gỗ", Style = "Minimalist", InStock = true, IsActive = true, CreatedAt = now, Brand = "BeeShop" },
            new Product { Id = 102, Sku = "BEE-102", Slug = "den-ban-pixar", Name = "Đèn Bàn Pixar", Price = 350000, CategoryId = 2, Category = "Lighting", Image = "https://picsum.photos/id/103/400/500", HoverImage = "https://picsum.photos/id/104/400/500", Tag = "-20%", Rating = 4.9, Reviews = 120, Color = "#333333", Material = "Kim loại", Style = "Hiện đại", InStock = true, IsActive = true, CreatedAt = now, Brand = "BeeShop" },
            new Product { Id = 103, Sku = "BEE-103", Slug = "bang-ghim-ghi-chu", Name = "Bảng Ghim Ghi Chú", Price = 120000, CategoryId = 1, Category = "Phụ kiện bàn", Image = "https://picsum.photos/id/106/400/500", HoverImage = "https://picsum.photos/id/107/400/500", Rating = 4.5, Reviews = 30, Color = "#D2B48C", Material = "Vải", Style = "Vintage", InStock = true, IsActive = true, CreatedAt = now, Brand = "BeeShop" },
            new Product { Id = 104, Sku = "BEE-104", Slug = "chau-cay-mini-de-ban", Name = "Chậu Cây Mini Để Bàn", Price = 85000, CategoryId = 3, Category = "Decor", Image = "https://picsum.photos/id/112/400/500", HoverImage = "https://picsum.photos/id/113/400/500", Tag = "Best Seller", Rating = 5, Reviews = 210, Color = "#4CAF50", Material = "Gốm sứ", Style = "Dễ thương", InStock = true, IsActive = true, CreatedAt = now, Brand = "BeeShop" },
            new Product { Id = 105, Sku = "BEE-105", Slug = "lich-go-de-ban", Name = "Lịch Gỗ Để Bàn", Price = 190000, CategoryId = 1, Category = "Phụ kiện bàn", Image = "https://picsum.photos/id/133/400/500", HoverImage = "https://picsum.photos/id/134/400/500", Rating = 4.7, Reviews = 15, Color = "#8B4513", Material = "Gỗ", Style = "Minimalist", InStock = true, IsActive = true, CreatedAt = now, Brand = "BeeShop" },
            new Product { Id = 106, Sku = "BEE-106", Slug = "coc-gom-handmade", Name = "Cốc Gốm Handmade", Price = 145000, OriginalPrice = 160000, CategoryId = 3, Category = "Decor", Image = "https://picsum.photos/id/145/400/500", HoverImage = "https://picsum.photos/id/146/400/500", Rating = 4.6, Reviews = 55, Color = "#FFFFFF", Material = "Gốm sứ", Style = "Vintage", InStock = true, IsActive = true, CreatedAt = now, Brand = "BeeShop" },
            new Product { Id = 107, Sku = "BEE-107", Slug = "dong-ho-lat-so", Name = "Đồng Hồ Lật Số", Price = 450000, CategoryId = 3, Category = "Decor", Image = "https://picsum.photos/id/175/400/500", HoverImage = "https://picsum.photos/id/176/400/500", Tag = "Sold Out", Rating = 4.9, Reviews = 80, Color = "#333333", Material = "Nhựa", Style = "Hiện đại", InStock = true, IsActive = true, CreatedAt = now, Brand = "BeeShop" },
            new Product { Id = 108, Sku = "BEE-108", Slug = "tham-chuot-da", Name = "Thảm Chuột Da", Price = 220000, CategoryId = 1, Category = "Phụ kiện bàn", Image = "https://picsum.photos/id/160/400/500", HoverImage = "https://picsum.photos/id/161/400/500", Rating = 4.8, Reviews = 90, Color = "#8B4513", Material = "Da", Style = "Minimalist", Brand = "Nordic Nest", InStock = true, IsActive = true, CreatedAt = now },
            new Product { Id = 109, Sku = "BEE-109", Slug = "bo-khay-go-trang-tri-ban-an", Name = "Bộ Khay Gỗ Trang Trí Bàn Ăn", Price = 520000, OriginalPrice = 690000, CategoryId = 6, Category = "Kitchen", Image = "https://picsum.photos/id/140/400/500", HoverImage = "https://picsum.photos/id/141/400/500", Rating = 4.6, Reviews = 66, Color = "#B08968", Material = "Gỗ", Style = "Vintage", Brand = "Moc Decor", InStock = true, IsActive = true, CreatedAt = now },
            new Product { Id = 110, Sku = "BEE-110", Slug = "den-tha-tran-cafe-loft", Name = "Đèn Thả Trần Cafe Loft", Price = 890000, CategoryId = 2, Category = "Lighting", Image = "https://picsum.photos/id/321/400/500", HoverImage = "https://picsum.photos/id/322/400/500", Tag = "Best Seller", Rating = 4.9, Reviews = 143, Color = "#222222", Material = "Kim loại", Style = "Hiện đại", Brand = "LumiHome", InStock = true, IsActive = true, CreatedAt = now },
            new Product { Id = 111, Sku = "BEE-111", Slug = "goi-tua-sofa-boho", Name = "Gối Tựa Sofa Boho", Price = 180000, OriginalPrice = 240000, CategoryId = 5, Category = "Textile", Image = "https://picsum.photos/id/325/400/500", HoverImage = "https://picsum.photos/id/326/400/500", Rating = 4.4, Reviews = 38, Color = "#E0A96D", Material = "Vải", Style = "Dễ thương", Brand = "SoftNest", InStock = true, IsActive = true, CreatedAt = now },
            new Product { Id = 112, Sku = "BEE-112", Slug = "ke-go-treo-tuong-hex", Name = "Kệ Gỗ Treo Tường Hex", Price = 430000, CategoryId = 3, Category = "Decor", Image = "https://picsum.photos/id/330/400/500", HoverImage = "https://picsum.photos/id/331/400/500", Rating = 4.7, Reviews = 57, Color = "#7F5539", Material = "Gỗ", Style = "Minimalist", Brand = "BeeLiving", InStock = false, IsActive = true, CreatedAt = now },
            new Product { Id = 113, Sku = "BEE-113", Slug = "tham-lua-trang-tri-phong-ngu", Name = "Thảm Lụa Trang Trí Phòng Ngủ", Price = 760000, OriginalPrice = 960000, CategoryId = 5, Category = "Textile", Image = "https://picsum.photos/id/338/400/500", HoverImage = "https://picsum.photos/id/339/400/500", Rating = 4.9, Reviews = 102, Color = "#C9ADA7", Material = "Vải", Style = "Hiện đại", Brand = "SoftNest", InStock = true, IsActive = true, CreatedAt = now },
            new Product { Id = 114, Sku = "BEE-114", Slug = "set-thia-nia-go-6-mon", Name = "Set Thìa Nĩa Gỗ 6 Món", Price = 250000, CategoryId = 6, Category = "Kitchen", Image = "https://picsum.photos/id/344/400/500", HoverImage = "https://picsum.photos/id/345/400/500", Rating = 4.3, Reviews = 22, Color = "#A47148", Material = "Gỗ", Style = "Vintage", Brand = "Moc Decor", InStock = true, IsActive = true, CreatedAt = now },
            new Product { Id = 115, Sku = "BEE-115", Slug = "den-ngu-go-co-dimmer", Name = "Đèn Ngủ Gỗ Có Dimmer", Price = 680000, CategoryId = 2, Category = "Lighting", Image = "https://picsum.photos/id/350/400/500", HoverImage = "https://picsum.photos/id/351/400/500", Tag = "NEW", Rating = 4.8, Reviews = 41, Color = "#2D2D2D", Material = "Gỗ", Style = "Minimalist", Brand = "LumiHome", InStock = true, IsActive = true, CreatedAt = now },
            new Product { Id = 116, Sku = "BEE-116", Slug = "tu-dau-giuong-2-ngan-keo", Name = "Tủ Đầu Giường 2 Ngăn Kéo", Price = 1490000, CategoryId = 4, Category = "Furniture", Image = "https://picsum.photos/id/355/400/500", HoverImage = "https://picsum.photos/id/356/400/500", Rating = 4.6, Reviews = 29, Color = "#8D6E63", Material = "Gỗ", Style = "Hiện đại", Brand = "Nordic Nest", InStock = true, IsActive = true, CreatedAt = now },
            new Product { Id = 117, Sku = "BEE-117", Slug = "khan-trai-ban-linen-kem", Name = "Khăn Trải Bàn Linen Kem", Price = 310000, OriginalPrice = 390000, CategoryId = 6, Category = "Kitchen", Image = "https://picsum.photos/id/361/400/500", HoverImage = "https://picsum.photos/id/362/400/500", Rating = 4.5, Reviews = 36, Color = "#EDE0D4", Material = "Vải", Style = "Minimalist", Brand = "BeeLiving", InStock = false, IsActive = true, CreatedAt = now },
            new Product { Id = 118, Sku = "BEE-118", Slug = "bo-3-khung-tranh-truu-tuong", Name = "Bộ 3 Khung Tranh Trừu Tượng", Price = 580000, CategoryId = 3, Category = "Decor", Image = "https://picsum.photos/id/368/400/500", HoverImage = "https://picsum.photos/id/369/400/500", Rating = 4.7, Reviews = 73, Color = "#B0A8B9", Material = "Canvas", Style = "Hiện đại", Brand = "Artify", InStock = true, IsActive = true, CreatedAt = now },
            new Product { Id = 119, Sku = "BEE-119", Slug = "nen-thom-vani-hu-thuy-tinh", Name = "Nến Thơm Vani Hũ Thủy Tinh", Price = 165000, OriginalPrice = 210000, CategoryId = 3, Category = "Decor", Image = "https://picsum.photos/id/375/400/500", HoverImage = "https://picsum.photos/id/376/400/500", Rating = 4.2, Reviews = 64, Color = "#FFF4D6", Material = "Sáp đậu nành", Style = "Dễ thương", Brand = "AromaBee", InStock = true, IsActive = true, CreatedAt = now },
            new Product { Id = 120, Sku = "BEE-120", Slug = "binh-hoa-thuy-tinh-xanh-rieu", Name = "Bình Hoa Thủy Tinh Xanh Rêu", Price = 410000, CategoryId = 3, Category = "Decor", Image = "https://picsum.photos/id/381/400/500", HoverImage = "https://picsum.photos/id/382/400/500", Rating = 4.8, Reviews = 88, Color = "#2A9D8F", Material = "Thủy tinh", Style = "Vintage", Brand = "Artify", InStock = true, IsActive = true, CreatedAt = now },
            new Product { Id = 121, Sku = "BEE-121", Slug = "ghe-don-boc-vai-nhung", Name = "Ghế Đôn Bọc Vải Nhung", Price = 980000, CategoryId = 4, Category = "Furniture", Image = "https://picsum.photos/id/388/400/500", HoverImage = "https://picsum.photos/id/389/400/500", Rating = 4.5, Reviews = 27, Color = "#6D597A", Material = "Vải", Style = "Vintage", Brand = "Nordic Nest", InStock = true, IsActive = true, CreatedAt = now },
            new Product { Id = 122, Sku = "BEE-122", Slug = "bo-ly-thuy-tinh-co-vien-vang", Name = "Bộ Ly Thủy Tinh Viền Vàng", Price = 460000, OriginalPrice = 520000, CategoryId = 6, Category = "Kitchen", Image = "https://picsum.photos/id/394/400/500", HoverImage = "https://picsum.photos/id/395/400/500", Rating = 4.9, Reviews = 112, Color = "#F4EBD0", Material = "Thủy tinh", Style = "Hiện đại", Brand = "Moc Decor", InStock = true, IsActive = true, CreatedAt = now },
            new Product { Id = 123, Sku = "BEE-123", Slug = "guong-tron-vien-go-soi", Name = "Gương Tròn Viền Gỗ Sồi", Price = 1250000, CategoryId = 3, Category = "Decor", Image = "https://picsum.photos/id/401/400/500", HoverImage = "https://picsum.photos/id/402/400/500", Rating = 4.7, Reviews = 46, Color = "#D6CCC2", Material = "Gỗ", Style = "Minimalist", Brand = "BeeLiving", InStock = true, IsActive = true, CreatedAt = now },
            new Product { Id = 124, Sku = "BEE-124", Slug = "set-khay-gom-breakfast", Name = "Set Khay Gốm Breakfast", Price = 340000, CategoryId = 6, Category = "Kitchen", Image = "https://picsum.photos/id/409/400/500", HoverImage = "https://picsum.photos/id/410/400/500", Rating = 4.3, Reviews = 18, Color = "#E3D5CA", Material = "Gốm sứ", Style = "Dễ thương", Brand = "AromaBee", InStock = false, IsActive = true, CreatedAt = now }
        );
    }
}


public sealed class SqlProductRepository : IProductRepository
{
    private readonly AppDbContext _context;

    public SqlProductRepository(AppDbContext context)
    {
        _context = context;
    }

    public IReadOnlyCollection<Product> GetAll()
    {
        return _context.Products.Include(p => p.CategoryNavigation).ToList();
    }

    public Product? GetById(int id)
    {
        return _context.Products.Include(p => p.CategoryNavigation).FirstOrDefault(p => p.Id == id);
    }

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

    public bool Delete(int id)
    {
        var product = GetById(id);
        if (product == null) return false;
        _context.Products.Remove(product);
        _context.SaveChanges();
        return true;
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
        return _context.Users.Include(u => u.Addresses).ToList();
    }

    public User? GetById(int id)
    {
        return _context.Users.Include(u => u.Addresses).FirstOrDefault(u => u.Id == id);
    }

    public User? GetByEmail(string email)
    {
        return _context.Users.Include(u => u.Addresses).FirstOrDefault(u => u.Email == email.ToLower());
    }

    public User? GetByToken(string token)
    {
        return _context.Users.Include(u => u.Addresses).FirstOrDefault(u => u.CurrentToken == token);
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

// --- CẬP NHẬT DEPENDENCY INJECTION ---
public static class InfrastructureDependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        // Sử dụng SqlProductRepository thay vì InMemoryProductRepository
        services.AddScoped<IProductRepository, SqlProductRepository>();
        
        // Đổi từ Singleton InMemory sang Scoped cho EF Core
        services.AddScoped<IUserRepository, SqlUserRepository>(); 
        return services;
    }
}