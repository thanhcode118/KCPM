using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HomeDecorShop.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProductAndCategorySeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Sku = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    OriginalPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Image = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HoverImage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    VideoUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Tag = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SoldPercentage = table.Column<int>(type: "int", nullable: true),
                    StockLeft = table.Column<int>(type: "int", nullable: false),
                    Rating = table.Column<double>(type: "float", nullable: false),
                    Reviews = table.Column<int>(type: "int", nullable: false),
                    Brand = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Color = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Material = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Style = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    InStock = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Products_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "IsActive", "Name", "Slug" },
                values: new object[,]
                {
                    { 1, true, "Phụ kiện bàn", "phu-kien-ban" },
                    { 2, true, "Lighting", "lighting" },
                    { 3, true, "Decor", "decor" },
                    { 4, true, "Furniture", "furniture" },
                    { 5, true, "Textile", "textile" },
                    { 6, true, "Kitchen", "kitchen" }
                });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Brand", "Category", "CategoryId", "Color", "CreatedAt", "HoverImage", "Image", "InStock", "IsActive", "Material", "Name", "OriginalPrice", "Price", "Rating", "Reviews", "Sku", "Slug", "SoldPercentage", "StockLeft", "Style", "Tag", "VideoUrl" },
                values: new object[,]
                {
                    { 101, "BeeShop", "Phụ kiện bàn", 1, "#8B4513", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "https://picsum.photos/id/102/400/500", "https://picsum.photos/id/101/400/500", true, true, "Gỗ", "Khay Cắm Bút Gỗ Sồi", 180000m, 150000m, 4.7999999999999998, 45, "BEE-101", "khay-cam-but-go-soi", null, 0, "Minimalist", "NEW", null },
                    { 102, "BeeShop", "Lighting", 2, "#333333", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "https://picsum.photos/id/104/400/500", "https://picsum.photos/id/103/400/500", true, true, "Kim loại", "Đèn Bàn Pixar", null, 350000m, 4.9000000000000004, 120, "BEE-102", "den-ban-pixar", null, 0, "Hiện đại", "-20%", null },
                    { 103, "BeeShop", "Phụ kiện bàn", 1, "#D2B48C", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "https://picsum.photos/id/107/400/500", "https://picsum.photos/id/106/400/500", true, true, "Vải", "Bảng Ghim Ghi Chú", null, 120000m, 4.5, 30, "BEE-103", "bang-ghim-ghi-chu", null, 0, "Vintage", null, null },
                    { 104, "BeeShop", "Decor", 3, "#4CAF50", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "https://picsum.photos/id/113/400/500", "https://picsum.photos/id/112/400/500", true, true, "Gốm sứ", "Chậu Cây Mini Để Bàn", null, 85000m, 5.0, 210, "BEE-104", "chau-cay-mini-de-ban", null, 0, "Dễ thương", "Best Seller", null },
                    { 105, "BeeShop", "Phụ kiện bàn", 1, "#8B4513", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "https://picsum.photos/id/134/400/500", "https://picsum.photos/id/133/400/500", true, true, "Gỗ", "Lịch Gỗ Để Bàn", null, 190000m, 4.7000000000000002, 15, "BEE-105", "lich-go-de-ban", null, 0, "Minimalist", null, null },
                    { 106, "BeeShop", "Decor", 3, "#FFFFFF", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "https://picsum.photos/id/146/400/500", "https://picsum.photos/id/145/400/500", true, true, "Gốm sứ", "Cốc Gốm Handmade", 160000m, 145000m, 4.5999999999999996, 55, "BEE-106", "coc-gom-handmade", null, 0, "Vintage", null, null },
                    { 107, "BeeShop", "Decor", 3, "#333333", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "https://picsum.photos/id/176/400/500", "https://picsum.photos/id/175/400/500", true, true, "Nhựa", "Đồng Hồ Lật Số", null, 450000m, 4.9000000000000004, 80, "BEE-107", "dong-ho-lat-so", null, 0, "Hiện đại", "Sold Out", null },
                    { 108, "Nordic Nest", "Phụ kiện bàn", 1, "#8B4513", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "https://picsum.photos/id/161/400/500", "https://picsum.photos/id/160/400/500", true, true, "Da", "Thảm Chuột Da", null, 220000m, 4.7999999999999998, 90, "BEE-108", "tham-chuot-da", null, 0, "Minimalist", null, null },
                    { 109, "Moc Decor", "Kitchen", 6, "#B08968", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "https://picsum.photos/id/141/400/500", "https://picsum.photos/id/140/400/500", true, true, "Gỗ", "Bộ Khay Gỗ Trang Trí Bàn Ăn", 690000m, 520000m, 4.5999999999999996, 66, "BEE-109", "bo-khay-go-trang-tri-ban-an", null, 0, "Vintage", null, null },
                    { 110, "LumiHome", "Lighting", 2, "#222222", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "https://picsum.photos/id/322/400/500", "https://picsum.photos/id/321/400/500", true, true, "Kim loại", "Đèn Thả Trần Cafe Loft", null, 890000m, 4.9000000000000004, 143, "BEE-110", "den-tha-tran-cafe-loft", null, 0, "Hiện đại", "Best Seller", null },
                    { 111, "SoftNest", "Textile", 5, "#E0A96D", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "https://picsum.photos/id/326/400/500", "https://picsum.photos/id/325/400/500", true, true, "Vải", "Gối Tựa Sofa Boho", 240000m, 180000m, 4.4000000000000004, 38, "BEE-111", "goi-tua-sofa-boho", null, 0, "Dễ thương", null, null },
                    { 112, "BeeLiving", "Decor", 3, "#7F5539", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "https://picsum.photos/id/331/400/500", "https://picsum.photos/id/330/400/500", false, true, "Gỗ", "Kệ Gỗ Treo Tường Hex", null, 430000m, 4.7000000000000002, 57, "BEE-112", "ke-go-treo-tuong-hex", null, 0, "Minimalist", null, null },
                    { 113, "SoftNest", "Textile", 5, "#C9ADA7", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "https://picsum.photos/id/339/400/500", "https://picsum.photos/id/338/400/500", true, true, "Vải", "Thảm Lụa Trang Trí Phòng Ngủ", 960000m, 760000m, 4.9000000000000004, 102, "BEE-113", "tham-lua-trang-tri-phong-ngu", null, 0, "Hiện đại", null, null },
                    { 114, "Moc Decor", "Kitchen", 6, "#A47148", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "https://picsum.photos/id/345/400/500", "https://picsum.photos/id/344/400/500", true, true, "Gỗ", "Set Thìa Nĩa Gỗ 6 Món", null, 250000m, 4.2999999999999998, 22, "BEE-114", "set-thia-nia-go-6-mon", null, 0, "Vintage", null, null },
                    { 115, "LumiHome", "Lighting", 2, "#2D2D2D", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "https://picsum.photos/id/351/400/500", "https://picsum.photos/id/350/400/500", true, true, "Gỗ", "Đèn Ngủ Gỗ Có Dimmer", null, 680000m, 4.7999999999999998, 41, "BEE-115", "den-ngu-go-co-dimmer", null, 0, "Minimalist", "NEW", null },
                    { 116, "Nordic Nest", "Furniture", 4, "#8D6E63", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "https://picsum.photos/id/356/400/500", "https://picsum.photos/id/355/400/500", true, true, "Gỗ", "Tủ Đầu Giường 2 Ngăn Kéo", null, 1490000m, 4.5999999999999996, 29, "BEE-116", "tu-dau-giuong-2-ngan-keo", null, 0, "Hiện đại", null, null },
                    { 117, "BeeLiving", "Kitchen", 6, "#EDE0D4", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "https://picsum.photos/id/362/400/500", "https://picsum.photos/id/361/400/500", false, true, "Vải", "Khăn Trải Bàn Linen Kem", 390000m, 310000m, 4.5, 36, "BEE-117", "khan-trai-ban-linen-kem", null, 0, "Minimalist", null, null },
                    { 118, "Artify", "Decor", 3, "#B0A8B9", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "https://picsum.photos/id/369/400/500", "https://picsum.photos/id/368/400/500", true, true, "Canvas", "Bộ 3 Khung Tranh Trừu Tượng", null, 580000m, 4.7000000000000002, 73, "BEE-118", "bo-3-khung-tranh-truu-tuong", null, 0, "Hiện đại", null, null },
                    { 119, "AromaBee", "Decor", 3, "#FFF4D6", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "https://picsum.photos/id/376/400/500", "https://picsum.photos/id/375/400/500", true, true, "Sáp đậu nành", "Nến Thơm Vani Hũ Thủy Tinh", 210000m, 165000m, 4.2000000000000002, 64, "BEE-119", "nen-thom-vani-hu-thuy-tinh", null, 0, "Dễ thương", null, null },
                    { 120, "Artify", "Decor", 3, "#2A9D8F", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "https://picsum.photos/id/382/400/500", "https://picsum.photos/id/381/400/500", true, true, "Thủy tinh", "Bình Hoa Thủy Tinh Xanh Rêu", null, 410000m, 4.7999999999999998, 88, "BEE-120", "binh-hoa-thuy-tinh-xanh-rieu", null, 0, "Vintage", null, null },
                    { 121, "Nordic Nest", "Furniture", 4, "#6D597A", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "https://picsum.photos/id/389/400/500", "https://picsum.photos/id/388/400/500", true, true, "Vải", "Ghế Đôn Bọc Vải Nhung", null, 980000m, 4.5, 27, "BEE-121", "ghe-don-boc-vai-nhung", null, 0, "Vintage", null, null },
                    { 122, "Moc Decor", "Kitchen", 6, "#F4EBD0", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "https://picsum.photos/id/395/400/500", "https://picsum.photos/id/394/400/500", true, true, "Thủy tinh", "Bộ Ly Thủy Tinh Viền Vàng", 520000m, 460000m, 4.9000000000000004, 112, "BEE-122", "bo-ly-thuy-tinh-co-vien-vang", null, 0, "Hiện đại", null, null },
                    { 123, "BeeLiving", "Decor", 3, "#D6CCC2", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "https://picsum.photos/id/402/400/500", "https://picsum.photos/id/401/400/500", true, true, "Gỗ", "Gương Tròn Viền Gỗ Sồi", null, 1250000m, 4.7000000000000002, 46, "BEE-123", "guong-tron-vien-go-soi", null, 0, "Minimalist", null, null },
                    { 124, "AromaBee", "Kitchen", 6, "#E3D5CA", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "https://picsum.photos/id/410/400/500", "https://picsum.photos/id/409/400/500", false, true, "Gốm sứ", "Set Khay Gốm Breakfast", null, 340000m, 4.2999999999999998, 18, "BEE-124", "set-khay-gom-breakfast", null, 0, "Dễ thương", null, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Products_CategoryId",
                table: "Products",
                column: "CategoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}
