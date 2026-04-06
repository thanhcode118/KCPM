using HomeDecorShop.API;
using HomeDecorShop.Application;
using HomeDecorShop.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
// using HomeDecorShop.Application.Promotions;

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

// Các dịch vụ mở rộng của Nhóm (Giả định đã có trong project)
// builder.Services.AddApiControllers(); 
// builder.Services.AddApiExceptionHandling();
// builder.Services.AddApiSwagger();

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

// Khởi tạo Database (Nếu nhóm có hỗ trợ)
app.InitializeDatabase();

app.UseHttpsRedirection();
app.UseCors("Frontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

// Giữ lại các Endpoint Minimal API quan trọng cho Frontend hiện tại
// app.MapGet("/api/promotions", ([FromServices] GetPromotionsHandler handler) =>
// {
//     var result = handler.Handle(new GetPromotionsQuery());
//     return Results.Ok(result);
// });

app.Run();
