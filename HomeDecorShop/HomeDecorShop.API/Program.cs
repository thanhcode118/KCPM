using HomeDecorShop.API;
using HomeDecorShop.Application;
using HomeDecorShop.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình Logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Cửa ngõ kết nối Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Đăng ký các lớp (Layers)
builder.Services.AddApplication();
builder.Services.AddInfrastructure();

// Dự phòng nếu nhóm chưa định nghĩa các hàm trên
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Cấu hình CORS (Cho phép Frontend truy cập)
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

var app = builder.Build();

// Khởi tạo Database (tự động tạo schema + seed dữ liệu)
app.InitializeDatabase();

app.UseHttpsRedirection();
app.UseCors("Frontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

// =====================================================
// PHẦN CỦA BẠN: Endpoint Khuyến mại (Giá mới / Giá cũ)
// Trả về danh sách sản phẩm đang có OnSaleOnly = true
// Được gọi bởi Frontend tại: GET /api/promotions
// =====================================================
app.MapGet("/api/promotions", ([FromServices] IProductService productService) =>
{
    var result = productService.Search(new ProductQuery(
        Query: null, Category: null, Brand: null, Style: null,
        MinPrice: null, MaxPrice: null, InStockOnly: false, OnSaleOnly: true,
        RatingGte: null, SortBy: null, Page: 1, PageSize: 20));
    return Results.Ok(result.Items);
});

app.Run();
