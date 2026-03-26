using HomeDecorShop.Application;
using HomeDecorShop.Infrastructure;
using HomeDecorShop.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// ---> ĐĂNG KÝ DBCONTEXT KẾT NỐI SQL SERVER <---
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddApplication();
builder.Services.AddInfrastructure();
builder.Services.AddControllers(); // Thêm cái này nếu cần cho MVC Controllers cũ

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200", "http://127.0.0.1:4200",
                "http://localhost:5173", "http://127.0.0.1:5173",
                "http://localhost:3000", "http://127.0.0.1:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Thêm cấu hình Swagger (Giao diện test API)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Auto-seed Admin Account
using (var scope = app.Services.CreateScope())
{
    var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    // --- XÓA TOÀN BỘ TÀI KHOẢN HIỆN TẠI (ĐÃ COMMENT LẠI ĐỂ TRÁNH MẤT DỮ LIỆU) ---
    // db.Users.RemoveRange(db.Users.ToList());
    // db.SaveChanges();

    // Tạo tài khoản admin1 nếu chưa có
    if (!db.Users.Any(u => u.Email == "admin1"))
    {
        userService.Register(new RegisterUserInput("admin1", "Administrator", "0123456789", "admin123", "admin"));
    }
}

app.UseHttpsRedirection();
app.UseCors("Frontend");

// Kích hoạt Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ==========================================
// API PRODUCTS
// ==========================================
app.MapGet("/api/products", (
    [FromServices] IProductService productService,
    string? q,
    string? category,
    string? brand,
    string? style,
    decimal? minPrice,
    decimal? maxPrice,
    bool? inStock,
    bool? onSale,
    int? ratingGte,
    string? sort,
    int? page,
    int? pageSize) =>
{
    var result = productService.Search(new ProductQuery(
        q,
        category,
        brand,
        style,
        minPrice,
        maxPrice,
        inStock ?? false,
        onSale ?? false,
        ratingGte,
        sort,
        page ?? 1,
        pageSize ?? 20));

    return Results.Ok(result);
})
.WithName("GetProducts");

app.MapGet("/api/products/{id:int}", ([FromServices] IProductService productService, int id) =>
{
    var product = productService.GetById(id);
    return product is null ? Results.NotFound() : Results.Ok(product);
})
.WithName("GetProductById");

app.MapPost("/api/products", ([FromServices] IProductService productService, [FromBody] ProductUpsertInput input) =>
{
    var created = productService.Create(input);
    return Results.Created($"/api/products/{created.ProductId}", created);
})
.WithName("CreateProduct");

app.MapPut("/api/products/{id:int}", ([FromServices] IProductService productService, int id, [FromBody] ProductUpsertInput input) =>
{
    var updated = productService.Update(id, input);
    return updated is null ? Results.NotFound() : Results.Ok(updated);
})
.WithName("UpdateProduct");

app.MapDelete("/api/products/{id:int}", ([FromServices] IProductService productService, int id) =>
{
    var deleted = productService.Delete(id);
    return deleted ? Results.NoContent() : Results.NotFound();
})
.WithName("DeleteProduct");


// ==========================================
// API USERS & AUTHENTICATION
// ==========================================
app.MapGet("/api/users", ([FromServices] IUserService userService) =>
{
    var users = userService.GetAll();
    return Results.Ok(users);
})
.WithName("GetUsers");

app.MapPost("/api/users/register", ([FromServices] IUserService userService, [FromBody] RegisterUserInput input) =>
{
    try
    {
        var auth = userService.Register(input);
        return Results.Ok(auth);
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { message = ex.Message });
    }
})
.WithName("RegisterUser");

app.MapPost("/api/users/login", ([FromServices] IUserService userService, [FromBody] LoginInput input) =>
{
    try 
    {
        var auth = userService.Login(input);
        return auth is null
            ? Results.Unauthorized() 
            : Results.Ok(auth);
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { message = ex.Message });
    }
})
.WithName("LoginUser");

app.MapGet("/api/users/confirm-email", ([FromServices] IUserService userService, [FromQuery] string token) =>
{
    var success = userService.ConfirmEmail(token);
    if (success)
    {
        return Results.Ok(new { message = "Xác nhận Email thành công! Bạn có thể đăng nhập." });
    }
    return Results.BadRequest(new { message = "Mã xác nhận không hợp lệ hoặc đã hết hạn." });
})
.WithName("ConfirmEmail");

app.MapGet("/api/users/me", ([FromServices] IUserService userService, HttpContext httpContext) =>
{
    var token = GetToken(httpContext);
    var user = userService.GetByToken(token);
    return user is null ? Results.Unauthorized() : Results.Ok(user);
})
.WithName("GetCurrentUser");

app.MapPut("/api/users/me", ([FromServices] IUserService userService, HttpContext httpContext, [FromBody] UpdateProfileInput input) =>
{
    var token = GetToken(httpContext);
    var user = userService.UpdateProfile(token, input);
    return user is null ? Results.Unauthorized() : Results.Ok(user);
})
.WithName("UpdateCurrentUser");

app.MapPost("/api/users/me/addresses", ([FromServices] IUserService userService, HttpContext httpContext, [FromBody] UpsertAddressInput input) =>
{
    var token = GetToken(httpContext);
    var user = userService.AddAddress(token, input);
    return user is null ? Results.Unauthorized() : Results.Ok(user);
})
.WithName("AddCurrentUserAddress");

app.MapPut("/api/users/{id:int}/role", ([FromServices] IUserService userService, int id, [FromBody] string newRole) =>
{
    var role = newRole.ToLower() == "admin" ? UserRole.Admin : UserRole.Customer;
    var success = userService.UpdateRole(id, role);
    return success ? Results.Ok(new { message = "Cập nhật quyền thành công." }) : Results.NotFound();
})
.WithName("UpdateUserRole");

app.Run();


// ==========================================
// HELPER METHODS
// ==========================================
static string GetToken(HttpContext context)
{
    if (context.Request.Headers.TryGetValue("X-Auth-Token", out var token))
    {
        return token.ToString();
    }

    if (context.Request.Headers.TryGetValue("Authorization", out var auth))
    {
        var value = auth.ToString();
        const string prefix = "Bearer ";
        if (value.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
        {
            return value[prefix.Length..].Trim();
        }
    }

    return string.Empty;
}
