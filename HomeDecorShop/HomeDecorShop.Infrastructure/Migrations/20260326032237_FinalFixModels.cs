using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HomeDecorShop.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FinalFixModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Address_Users_UserId",
                table: "Address");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Products",
                table: "Products");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Address",
                table: "Address");

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 101);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 102);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 103);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 104);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 105);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 106);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 107);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 108);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 109);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 110);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 111);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 112);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 113);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 114);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 115);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 116);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 117);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 118);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 119);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 120);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 121);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 122);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 123);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 124);

            migrationBuilder.DropColumn(
                name: "Id",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "IsPromotion",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "OriginalPrice",
                table: "Products");

            migrationBuilder.RenameTable(
                name: "Address",
                newName: "Addresses");

            migrationBuilder.RenameIndex(
                name: "IX_Address_UserId",
                table: "Addresses",
                newName: "IX_Addresses_UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Products",
                table: "Products",
                column: "ProductId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Addresses",
                table: "Addresses",
                column: "Id");

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "ProductId", "Brand", "Category", "CategoryId", "Color", "CreatedAt", "Description", "HoverImage", "Image", "InStock", "IsActive", "Material", "OldPrice", "Price", "ProductName", "Rating", "Reviews", "Sku", "Slug", "SoldPercentage", "StockLeft", "Style", "Tag", "VideoUrl" },
                values: new object[,]
                {
                    { 101, "BeeShop", "Phụ kiện bàn", 1, "#8B4513", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/102/400/500", "https://picsum.photos/id/101/400/500", true, true, "Gỗ", 180000m, 150000m, "Khay Cắm Bút Gỗ Sồi", 4.7999999999999998, 45, "BEE-101", "khay-cam-but-go-soi", null, 0, "Minimalist", "NEW", null },
                    { 102, "BeeShop", "Lighting", 2, "#333333", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/104/400/500", "https://picsum.photos/id/103/400/500", true, true, "Kim loại", null, 350000m, "Đèn Bàn Pixar", 4.9000000000000004, 120, "BEE-102", "den-ban-pixar", null, 0, "Hiện đại", "-20%", null },
                    { 103, "BeeShop", "Phụ kiện bàn", 1, "#D2B48C", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/107/400/500", "https://picsum.photos/id/106/400/500", true, true, "Vải", null, 120000m, "Bảng Ghim Ghi Chú", 4.5, 30, "BEE-103", "bang-ghim-ghi-chu", null, 0, "Vintage", null, null },
                    { 104, "BeeShop", "Decor", 3, "#4CAF50", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/113/400/500", "https://picsum.photos/id/112/400/500", true, true, "Gốm sứ", null, 85000m, "Chậu Cây Mini Để Bàn", 5.0, 210, "BEE-104", "chau-cay-mini-de-ban", null, 0, "Dễ thương", "Best Seller", null },
                    { 105, "BeeShop", "Phụ kiện bàn", 1, "#8B4513", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/134/400/500", "https://picsum.photos/id/133/400/500", true, true, "Gỗ", null, 190000m, "Lịch Gỗ Để Bàn", 4.7000000000000002, 15, "BEE-105", "lich-go-de-ban", null, 0, "Minimalist", null, null },
                    { 106, "BeeShop", "Decor", 3, "#FFFFFF", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/146/400/500", "https://picsum.photos/id/145/400/500", true, true, "Gốm sứ", 160000m, 145000m, "Cốc Gốm Handmade", 4.5999999999999996, 55, "BEE-106", "coc-gom-handmade", null, 0, "Vintage", null, null },
                    { 107, "BeeShop", "Decor", 3, "#333333", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/176/400/500", "https://picsum.photos/id/175/400/500", true, true, "Nhựa", null, 450000m, "Đồng Hồ Lật Số", 4.9000000000000004, 80, "BEE-107", "dong-ho-lat-so", null, 0, "Hiện đại", "Sold Out", null },
                    { 108, "Nordic Nest", "Phụ kiện bàn", 1, "#8B4513", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/161/400/500", "https://picsum.photos/id/160/400/500", true, true, "Da", null, 220000m, "Thảm Chuột Da", 4.7999999999999998, 90, "BEE-108", "tham-chuot-da", null, 0, "Minimalist", null, null },
                    { 109, "Moc Decor", "Kitchen", 6, "#B08968", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/141/400/500", "https://picsum.photos/id/140/400/500", true, true, "Gỗ", 690000m, 520000m, "Bộ Khay Gỗ Trang Trí Bàn Ăn", 4.5999999999999996, 66, "BEE-109", "bo-khay-go-trang-tri-ban-an", null, 0, "Vintage", null, null },
                    { 110, "LumiHome", "Lighting", 2, "#222222", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/322/400/500", "https://picsum.photos/id/321/400/500", true, true, "Kim loại", null, 890000m, "Đèn Thả Trần Cafe Loft", 4.9000000000000004, 143, "BEE-110", "den-tha-tran-cafe-loft", null, 0, "Hiện đại", "Best Seller", null },
                    { 111, "SoftNest", "Textile", 5, "#E0A96D", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/326/400/500", "https://picsum.photos/id/325/400/500", true, true, "Vải", 240000m, 180000m, "Gối Tựa Sofa Boho", 4.4000000000000004, 38, "BEE-111", "goi-tua-sofa-boho", null, 0, "Dễ thương", null, null },
                    { 112, "BeeLiving", "Decor", 3, "#7F5539", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/331/400/500", "https://picsum.photos/id/330/400/500", false, true, "Gỗ", null, 430000m, "Kệ Gỗ Treo Tường Hex", 4.7000000000000002, 57, "BEE-112", "ke-go-treo-tuong-hex", null, 0, "Minimalist", null, null },
                    { 113, "SoftNest", "Textile", 5, "#C9ADA7", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/339/400/500", "https://picsum.photos/id/338/400/500", true, true, "Vải", 960000m, 760000m, "Thảm Lụa Trang Trí Phòng Ngủ", 4.9000000000000004, 102, "BEE-113", "tham-lua-trang-tri-phong-ngu", null, 0, "Hiện đại", null, null },
                    { 114, "Moc Decor", "Kitchen", 6, "#A47148", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/345/400/500", "https://picsum.photos/id/344/400/500", true, true, "Gỗ", null, 250000m, "Set Thìa Nĩa Gỗ 6 Món", 4.2999999999999998, 22, "BEE-114", "set-thia-nia-go-6-mon", null, 0, "Vintage", null, null },
                    { 115, "LumiHome", "Lighting", 2, "#2D2D2D", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/351/400/500", "https://picsum.photos/id/350/400/500", true, true, "Gỗ", null, 680000m, "Đèn Ngủ Gỗ Có Dimmer", 4.7999999999999998, 41, "BEE-115", "den-ngu-go-co-dimmer", null, 0, "Minimalist", "NEW", null },
                    { 116, "Nordic Nest", "Furniture", 4, "#8D6E63", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/356/400/500", "https://picsum.photos/id/355/400/500", true, true, "Gỗ", null, 1490000m, "Tủ Đầu Giường 2 Ngăn Kéo", 4.5999999999999996, 29, "BEE-116", "tu-dau-giuong-2-ngan-keo", null, 0, "Hiện đại", null, null },
                    { 117, "BeeLiving", "Kitchen", 6, "#EDE0D4", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/362/400/500", "https://picsum.photos/id/361/400/500", false, true, "Vải", 390000m, 310000m, "Khăn Trải Bàn Linen Kem", 4.5, 36, "BEE-117", "khan-trai-ban-linen-kem", null, 0, "Minimalist", null, null },
                    { 118, "Artify", "Decor", 3, "#B0A8B9", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/369/400/500", "https://picsum.photos/id/368/400/500", true, true, "Canvas", null, 580000m, "Bộ 3 Khung Tranh Trừu Tượng", 4.7000000000000002, 73, "BEE-118", "bo-3-khung-tranh-truu-tuong", null, 0, "Hiện đại", null, null },
                    { 119, "AromaBee", "Decor", 3, "#FFF4D6", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/376/400/500", "https://picsum.photos/id/375/400/500", true, true, "Sáp đậu nành", 210000m, 165000m, "Nến Thơm Vani Hũ Thủy Tinh", 4.2000000000000002, 64, "BEE-119", "nen-thom-vani-hu-thuy-tinh", null, 0, "Dễ thương", null, null },
                    { 120, "Artify", "Decor", 3, "#2A9D8F", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/382/400/500", "https://picsum.photos/id/381/400/500", true, true, "Thủy tinh", null, 410000m, "Bình Hoa Thủy Tinh Xanh Rêu", 4.7999999999999998, 88, "BEE-120", "binh-hoa-thuy-tinh-xanh-rieu", null, 0, "Vintage", null, null },
                    { 121, "Nordic Nest", "Furniture", 4, "#6D597A", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/389/400/500", "https://picsum.photos/id/388/400/500", true, true, "Vải", null, 980000m, "Ghế Đôn Bọc Vải Nhung", 4.5, 27, "BEE-121", "ghe-don-boc-vai-nhung", null, 0, "Vintage", null, null },
                    { 122, "Moc Decor", "Kitchen", 6, "#F4EBD0", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/395/400/500", "https://picsum.photos/id/394/400/500", true, true, "Thủy tinh", 520000m, 460000m, "Bộ Ly Thủy Tinh Viền Vàng", 4.9000000000000004, 112, "BEE-122", "bo-ly-thuy-tinh-co-vien-vang", null, 0, "Hiện đại", null, null },
                    { 123, "BeeLiving", "Decor", 3, "#D6CCC2", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/402/400/500", "https://picsum.photos/id/401/400/500", true, true, "Gỗ", null, 1250000m, "Gương Tròn Viền Gỗ Sồi", 4.7000000000000002, 46, "BEE-123", "guong-tron-vien-go-soi", null, 0, "Minimalist", null, null },
                    { 124, "AromaBee", "Kitchen", 6, "#E3D5CA", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/410/400/500", "https://picsum.photos/id/409/400/500", false, true, "Gốm sứ", null, 340000m, "Set Khay Gốm Breakfast", 4.2999999999999998, 18, "BEE-124", "set-khay-gom-breakfast", null, 0, "Dễ thương", null, null }
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserId",
                keyValue: 99,
                column: "Email",
                value: "admin@gmail.com");

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_Users_UserId",
                table: "Addresses",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_Users_UserId",
                table: "Addresses");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Products",
                table: "Products");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Addresses",
                table: "Addresses");

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "ProductId",
                keyValue: 101);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "ProductId",
                keyValue: 102);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "ProductId",
                keyValue: 103);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "ProductId",
                keyValue: 104);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "ProductId",
                keyValue: 105);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "ProductId",
                keyValue: 106);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "ProductId",
                keyValue: 107);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "ProductId",
                keyValue: 108);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "ProductId",
                keyValue: 109);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "ProductId",
                keyValue: 110);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "ProductId",
                keyValue: 111);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "ProductId",
                keyValue: 112);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "ProductId",
                keyValue: 113);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "ProductId",
                keyValue: 114);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "ProductId",
                keyValue: 115);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "ProductId",
                keyValue: 116);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "ProductId",
                keyValue: 117);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "ProductId",
                keyValue: 118);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "ProductId",
                keyValue: 119);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "ProductId",
                keyValue: 120);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "ProductId",
                keyValue: 121);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "ProductId",
                keyValue: 122);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "ProductId",
                keyValue: 123);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "ProductId",
                keyValue: 124);

            migrationBuilder.RenameTable(
                name: "Addresses",
                newName: "Address");

            migrationBuilder.RenameIndex(
                name: "IX_Addresses_UserId",
                table: "Address",
                newName: "IX_Address_UserId");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "Products",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<bool>(
                name: "IsPromotion",
                table: "Products",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "OriginalPrice",
                table: "Products",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Products",
                table: "Products",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Address",
                table: "Address",
                column: "Id");

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Brand", "Category", "CategoryId", "Color", "CreatedAt", "Description", "HoverImage", "Image", "InStock", "IsActive", "IsPromotion", "Material", "Name", "OldPrice", "OriginalPrice", "Price", "ProductName", "Rating", "Reviews", "Sku", "Slug", "SoldPercentage", "StockLeft", "Style", "Tag", "VideoUrl" },
                values: new object[,]
                {
                    { 101, "BeeShop", "Phụ kiện bàn", 1, "#8B4513", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/102/400/500", "https://picsum.photos/id/101/400/500", true, true, false, "Gỗ", "Khay Cắm Bút Gỗ Sồi", null, 180000m, 150000m, null, 4.7999999999999998, 45, "BEE-101", "khay-cam-but-go-soi", null, 0, "Minimalist", "NEW", null },
                    { 102, "BeeShop", "Lighting", 2, "#333333", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/104/400/500", "https://picsum.photos/id/103/400/500", true, true, false, "Kim loại", "Đèn Bàn Pixar", null, null, 350000m, null, 4.9000000000000004, 120, "BEE-102", "den-ban-pixar", null, 0, "Hiện đại", "-20%", null },
                    { 103, "BeeShop", "Phụ kiện bàn", 1, "#D2B48C", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/107/400/500", "https://picsum.photos/id/106/400/500", true, true, false, "Vải", "Bảng Ghim Ghi Chú", null, null, 120000m, null, 4.5, 30, "BEE-103", "bang-ghim-ghi-chu", null, 0, "Vintage", null, null },
                    { 104, "BeeShop", "Decor", 3, "#4CAF50", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/113/400/500", "https://picsum.photos/id/112/400/500", true, true, false, "Gốm sứ", "Chậu Cây Mini Để Bàn", null, null, 85000m, null, 5.0, 210, "BEE-104", "chau-cay-mini-de-ban", null, 0, "Dễ thương", "Best Seller", null },
                    { 105, "BeeShop", "Phụ kiện bàn", 1, "#8B4513", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/134/400/500", "https://picsum.photos/id/133/400/500", true, true, false, "Gỗ", "Lịch Gỗ Để Bàn", null, null, 190000m, null, 4.7000000000000002, 15, "BEE-105", "lich-go-de-ban", null, 0, "Minimalist", null, null },
                    { 106, "BeeShop", "Decor", 3, "#FFFFFF", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/146/400/500", "https://picsum.photos/id/145/400/500", true, true, false, "Gốm sứ", "Cốc Gốm Handmade", null, 160000m, 145000m, null, 4.5999999999999996, 55, "BEE-106", "coc-gom-handmade", null, 0, "Vintage", null, null },
                    { 107, "BeeShop", "Decor", 3, "#333333", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/176/400/500", "https://picsum.photos/id/175/400/500", true, true, false, "Nhựa", "Đồng Hồ Lật Số", null, null, 450000m, null, 4.9000000000000004, 80, "BEE-107", "dong-ho-lat-so", null, 0, "Hiện đại", "Sold Out", null },
                    { 108, "Nordic Nest", "Phụ kiện bàn", 1, "#8B4513", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/161/400/500", "https://picsum.photos/id/160/400/500", true, true, false, "Da", "Thảm Chuột Da", null, null, 220000m, null, 4.7999999999999998, 90, "BEE-108", "tham-chuot-da", null, 0, "Minimalist", null, null },
                    { 109, "Moc Decor", "Kitchen", 6, "#B08968", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/141/400/500", "https://picsum.photos/id/140/400/500", true, true, false, "Gỗ", "Bộ Khay Gỗ Trang Trí Bàn Ăn", null, 690000m, 520000m, null, 4.5999999999999996, 66, "BEE-109", "bo-khay-go-trang-tri-ban-an", null, 0, "Vintage", null, null },
                    { 110, "LumiHome", "Lighting", 2, "#222222", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/322/400/500", "https://picsum.photos/id/321/400/500", true, true, false, "Kim loại", "Đèn Thả Trần Cafe Loft", null, null, 890000m, null, 4.9000000000000004, 143, "BEE-110", "den-tha-tran-cafe-loft", null, 0, "Hiện đại", "Best Seller", null },
                    { 111, "SoftNest", "Textile", 5, "#E0A96D", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/326/400/500", "https://picsum.photos/id/325/400/500", true, true, false, "Vải", "Gối Tựa Sofa Boho", null, 240000m, 180000m, null, 4.4000000000000004, 38, "BEE-111", "goi-tua-sofa-boho", null, 0, "Dễ thương", null, null },
                    { 112, "BeeLiving", "Decor", 3, "#7F5539", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/331/400/500", "https://picsum.photos/id/330/400/500", false, true, false, "Gỗ", "Kệ Gỗ Treo Tường Hex", null, null, 430000m, null, 4.7000000000000002, 57, "BEE-112", "ke-go-treo-tuong-hex", null, 0, "Minimalist", null, null },
                    { 113, "SoftNest", "Textile", 5, "#C9ADA7", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/339/400/500", "https://picsum.photos/id/338/400/500", true, true, false, "Vải", "Thảm Lụa Trang Trí Phòng Ngủ", null, 960000m, 760000m, null, 4.9000000000000004, 102, "BEE-113", "tham-lua-trang-tri-phong-ngu", null, 0, "Hiện đại", null, null },
                    { 114, "Moc Decor", "Kitchen", 6, "#A47148", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/345/400/500", "https://picsum.photos/id/344/400/500", true, true, false, "Gỗ", "Set Thìa Nĩa Gỗ 6 Món", null, null, 250000m, null, 4.2999999999999998, 22, "BEE-114", "set-thia-nia-go-6-mon", null, 0, "Vintage", null, null },
                    { 115, "LumiHome", "Lighting", 2, "#2D2D2D", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/351/400/500", "https://picsum.photos/id/350/400/500", true, true, false, "Gỗ", "Đèn Ngủ Gỗ Có Dimmer", null, null, 680000m, null, 4.7999999999999998, 41, "BEE-115", "den-ngu-go-co-dimmer", null, 0, "Minimalist", "NEW", null },
                    { 116, "Nordic Nest", "Furniture", 4, "#8D6E63", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/356/400/500", "https://picsum.photos/id/355/400/500", true, true, false, "Gỗ", "Tủ Đầu Giường 2 Ngăn Kéo", null, null, 1490000m, null, 4.5999999999999996, 29, "BEE-116", "tu-dau-giuong-2-ngan-keo", null, 0, "Hiện đại", null, null },
                    { 117, "BeeLiving", "Kitchen", 6, "#EDE0D4", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/362/400/500", "https://picsum.photos/id/361/400/500", false, true, false, "Vải", "Khăn Trải Bàn Linen Kem", null, 390000m, 310000m, null, 4.5, 36, "BEE-117", "khan-trai-ban-linen-kem", null, 0, "Minimalist", null, null },
                    { 118, "Artify", "Decor", 3, "#B0A8B9", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/369/400/500", "https://picsum.photos/id/368/400/500", true, true, false, "Canvas", "Bộ 3 Khung Tranh Trừu Tượng", null, null, 580000m, null, 4.7000000000000002, 73, "BEE-118", "bo-3-khung-tranh-truu-tuong", null, 0, "Hiện đại", null, null },
                    { 119, "AromaBee", "Decor", 3, "#FFF4D6", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/376/400/500", "https://picsum.photos/id/375/400/500", true, true, false, "Sáp đậu nành", "Nến Thơm Vani Hũ Thủy Tinh", null, 210000m, 165000m, null, 4.2000000000000002, 64, "BEE-119", "nen-thom-vani-hu-thuy-tinh", null, 0, "Dễ thương", null, null },
                    { 120, "Artify", "Decor", 3, "#2A9D8F", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/382/400/500", "https://picsum.photos/id/381/400/500", true, true, false, "Thủy tinh", "Bình Hoa Thủy Tinh Xanh Rêu", null, null, 410000m, null, 4.7999999999999998, 88, "BEE-120", "binh-hoa-thuy-tinh-xanh-rieu", null, 0, "Vintage", null, null },
                    { 121, "Nordic Nest", "Furniture", 4, "#6D597A", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/389/400/500", "https://picsum.photos/id/388/400/500", true, true, false, "Vải", "Ghế Đôn Bọc Vải Nhung", null, null, 980000m, null, 4.5, 27, "BEE-121", "ghe-don-boc-vai-nhung", null, 0, "Vintage", null, null },
                    { 122, "Moc Decor", "Kitchen", 6, "#F4EBD0", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/395/400/500", "https://picsum.photos/id/394/400/500", true, true, false, "Thủy tinh", "Bộ Ly Thủy Tinh Viền Vàng", null, 520000m, 460000m, null, 4.9000000000000004, 112, "BEE-122", "bo-ly-thuy-tinh-co-vien-vang", null, 0, "Hiện đại", null, null },
                    { 123, "BeeLiving", "Decor", 3, "#D6CCC2", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/402/400/500", "https://picsum.photos/id/401/400/500", true, true, false, "Gỗ", "Gương Tròn Viền Gỗ Sồi", null, null, 1250000m, null, 4.7000000000000002, 46, "BEE-123", "guong-tron-vien-go-soi", null, 0, "Minimalist", null, null },
                    { 124, "AromaBee", "Kitchen", 6, "#E3D5CA", new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), null, "https://picsum.photos/id/410/400/500", "https://picsum.photos/id/409/400/500", false, true, false, "Gốm sứ", "Set Khay Gốm Breakfast", null, null, 340000m, null, 4.2999999999999998, 18, "BEE-124", "set-khay-gom-breakfast", null, 0, "Dễ thương", null, null }
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserId",
                keyValue: 99,
                column: "Email",
                value: "admin");

            migrationBuilder.AddForeignKey(
                name: "FK_Address_Users_UserId",
                table: "Address",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
