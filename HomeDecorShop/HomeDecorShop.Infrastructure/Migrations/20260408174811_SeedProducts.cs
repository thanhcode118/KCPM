using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeDecorShop.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedProducts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Categories Seed
            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "IsActive", "Name", "Slug" },
                values: new object[,] {
                    { 1, true, "Bàn ăn", "bàn-ăn" },
                    { 2, true, "Cốc ly", "cốc-ly" },
                    { 3, true, "Hương thơm", "hương-thơm" },
                    { 4, true, "Mây tre", "mây-tre" },
                    { 5, true, "Mây tre đan", "mây-tre-đan" },
                    { 6, true, "Nội thất", "nội-thất" },
                    { 7, true, "Phụ kiện", "phụ-kiện" },
                    { 8, true, "Phụ kiện vải", "phụ-kiện-vải" },
                    { 9, true, "Phụ kiện điểm nhấn", "phụ-kiện-điểm-nhấn" },
                    { 10, true, "Thương hiệu gốm bát tràng", "thương-hiệu-gốm-bát-tràng" },
                    { 11, true, "Trang trí", "trang-trí" },
                    { 12, true, "Trang trí tường", "trang-trí-tường" },
                    { 13, true, "Trang điểm", "trang-điểm" },
                    { 14, true, "Đèn", "đèn" },
                    { 15, true, "Đồ trang điểm", "đồ-trang-điểm" },
                });

            // Products Seed Part 1 - 1-to-1 Mapping with Image Filenames
            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "ProductId", "Brand", "Category", "CategoryId", "Color", "CreatedAt", "Description", "HoverImage", "Image", "InStock", "IsActive", "Material", "OldPrice", "Price", "ProductName", "Rating", "Reviews", "Sku", "Slug", "SoldPercentage", "StockLeft", "Style", "Tag", "VideoUrl" },
                values: new object[,] {
                    { 1, "BeeShop", "Bàn ăn", 1, "Trắng", DateTime.UtcNow, "Bát sứ trắng kích thước lớn, phù hợp bày biện món chính trang trọng.", "assets/images/bat-lon.jpg", "assets/images/bat-lon.jpg", true, true, "Sứ", null, 120000m, "BÁT LỚN CAO CẤP", 4.5, 10, "BEE-001", "bát-lớn-cao-cấp", 0, 50, "Minimal", "NEW", null },
                    { 2, "BeeShop", "Bàn ăn", 1, "Nâu", DateTime.UtcNow, "Bát men gốm thủ công với họa tiết truyền thống Bát Tràng.", "assets/images/bat-men.jpg", "assets/images/bat-men.jpg", true, true, "Gốm", null, 85000m, "BÁT MEN BÁT TRÀNG", 4.5, 10, "BEE-002", "bát-men-bát-tràng", 0, 50, "Traditional", "NEW", null },
                    { 3, "BeeShop", "Bàn ăn", 1, "Xanh", DateTime.UtcNow, "Bát gốm nhỏ dùng cho gia vị hoặc các món ăn kèm xinh xắn.", "assets/images/bat-nho.jpg", "assets/images/bat-nho.jpg", true, true, "Gốm", null, 40000m, "BÁT GỐM NHỎ", 4.5, 10, "BEE-003", "bát-gốm-nhỏ", 0, 50, "Minimal", "NEW", null },
                    { 4, "BeeShop", "Trang trí", 11, "Xanh lá", DateTime.UtcNow, "Chậu cây cảnh mini để bàn, mang lại sức sống cho không gian làm việc.", "assets/images/chau-cay-mini.jpg", "assets/images/chau-cay-mini.jpg", true, true, "Gốm + Cây thật", null, 65000m, "CHẬU CÂY MINI", 4.5, 10, "BEE-004", "chậu-cây-mini", 0, 50, "Natural", "NEW", null },
                    { 5, "BeeShop", "Trang trí", 11, "Nâu đất", DateTime.UtcNow, "Chậu gốm trang trí nghệ thuật, bề mặt nhám mộc mạc.", "assets/images/chau-gom.jpg", "assets/images/chau-gom.jpg", true, true, "Gốm sứ", null, 11000m, "CHẬU GỐM DECOR", 4.5, 10, "BEE-005", "chậu-gốm-decor", 0, 50, "Rustic", "NEW", null },
                    { 6, "BeeShop", "Bàn ăn", 1, "Trắng", DateTime.UtcNow, "Bộ chén bát đa dạng kiểu dáng từ làng nghề Bát Tràng nổi tiếng.", "assets/images/chen-bat-trang.jpg", "assets/images/chen-bat-trang.jpg", true, true, "Gốm sứ", null, 350000m, "BỘ CHÉN BÁT TRÀNG", 4.5, 10, "BEE-006", "bộ-chén-bát-tràng", 0, 50, "Traditional", "NEW", null },
                    { 7, "BeeShop", "Cốc ly", 2, "Cổ điển", DateTime.UtcNow, "Cốc gốm Vintage với nước men độc đáo, giữ nhiệt tốt cho trà và cafe.", "assets/images/coc-gom-vintage-battrang.jpg", "assets/images/coc-gom-vintage-battrang.jpg", true, true, "Gốm", null, 95000m, "CỐC GỐM VINTAGE", 4.5, 10, "BEE-007", "cốc-gốm-vintage", 0, 50, "Vintage", "NEW", null },
                    { 8, "BeeShop", "Đèn", 14, "Đen", DateTime.UtcNow, "Đèn bàn phong cách cổ điển, ánh sáng dịu nhẹ bảo vệ đôi mắt.", "assets/images/den-ban.jpg", "assets/images/den-ban.jpg", true, true, "Kim loại", null, 420000m, "ĐÈN BÀN CLASSIC", 4.5, 10, "BEE-008", "đèn-bàn-classic", 0, 50, "Classic", "NEW", null },
                    { 9, "BeeShop", "Đèn", 14, "Trắng", DateTime.UtcNow, "Đèn bàn mini nhỏ gọn, tiện lợi cho việc đọc sách ban đêm.", "assets/images/den-ban-mini.jpg", "assets/images/den-ban-mini.jpg", true, true, "Nhựa cao cấp", null, 120000m, "ĐÈN BÀN MINI", 4.5, 10, "BEE-009", "đèn-bàn-mini", 0, 50, "Modern", "NEW", null },
                    { 10, "BeeShop", "Đèn", 14, "Vàng", DateTime.UtcNow, "Đèn ngủ hình cầu lung linh, tạo không gian huyền ảo cho căn phòng.", "assets/images/den-cau.jpg", "assets/images/den-cau.jpg", true, true, "Nhựa + LED", null, 90000m, "ĐÈN LED HÌNH CẦU", 4.5, 10, "BEE-010", "đèn-led-hình-cầu", 0, 50, "Modern", "NEW", null },
                    { 11, "BeeShop", "Đèn", 14, "Đa sắc", DateTime.UtcNow, "Dây đèn LED trang trí dây dài, linh hoạt lắp đặt mọi nơi.", "assets/images/den-day.jpg", "assets/images/den-day.jpg", true, true, "LED", null, 65000m, "ĐÈN LED DÂY", 4.5, 10, "BEE-011", "đèn-led-dây", 0, 50, "Chill", "NEW", null },
                    { 12, "BeeShop", "Đèn", 14, "Gỗ gỗ", DateTime.UtcNow, "Đèn ngủ được làm hoàn toàn từ gỗ tự nhiên, thiết kế tối giản sang trọng.", "assets/images/den-go.jpg", "assets/images/den-go.jpg", true, true, "Gỗ tự nhiên", null, 250000m, "ĐÈN NGỦ GỖ", 4.5, 10, "BEE-012", "đèn-ngủ-gỗ", 0, 50, "Rustic", "NEW", null },
                    { 13, "BeeShop", "Đèn", 14, "Đen", DateTime.UtcNow, "Đèn kẹp bàn tiện lợi, linh hoạt điều chỉnh hướng sáng.", "assets/images/den-kep.jpg", "assets/images/den-kep.jpg", true, true, "Kim loại", null, 150000m, "ĐÈN KẸP BÀN", 4.5, 10, "BEE-013", "đèn-kẹp-bàn", 0, 50, "Modern", "NEW", null },
                    { 14, "BeeShop", "Đèn", 14, "N/A", DateTime.UtcNow, "Bộ đèn LED đa năng dùng để trang trí tạo điểm nhấn không gian.", "assets/images/den-led-trang-tri.jpg", "assets/images/den-led-trang-tri.jpg", true, true, "LED", null, 100000m, "ĐÈN LED TRANG TRÍ", 4.5, 10, "BEE-014", "đèn-led-trang-trí", 0, 50, "Modern", "NEW", null },
                    { 15, "BeeShop", "Đèn", 14, "Mây tre", DateTime.UtcNow, "Đèn lồng mây tre đan thủ công, ánh sáng đẹp mắt độc đáo.", "assets/images/den-may.jpg", "assets/images/den-may.jpg", true, true, "Mây tre đan", null, 210000m, "ĐÈN MÂY TRE", 4.5, 10, "BEE-015", "đèn-mây-tre", 0, 50, "Traditional", "NEW", null },
                    { 16, "BeeShop", "Đèn", 14, "N/A", DateTime.UtcNow, "Sản phẩm đèn mini nhỏ gọn, dùng nguồn USB tiện ích.", "assets/images/den-mini.jpg", "assets/images/den-mini.jpg", true, true, "Nhựa", null, 55000m, "ĐÈN MINI USB", 4.5, 10, "BEE-016", "đèn-mini-usb", 0, 50, "Minimal", "NEW", null },
                    { 17, "BeeShop", "Đèn", 14, "Neon", DateTime.UtcNow, "Đèn Neon chữ trang trí cá tính cho phòng Gaming.", "assets/images/den-neon-chu.jpg", "assets/images/den-neon-chu.jpg", true, true, "LED Neon", null, 280000m, "ĐÈN NEON CHỮ", 4.5, 10, "BEE-017", "đèn-neon-chữ", 0, 50, "Modern", "NEW", null },
                    { 18, "BeeShop", "Đèn", 14, "Trắng", DateTime.UtcNow, "Đèn ngủ LED hiện đại, tích hợp cảm nhận ánh sáng thông minh.", "assets/images/den-ngu-led.jpg", "assets/images/den-ngu-led.jpg", true, true, "LED", null, 120000m, "ĐÈN NGỦ LED", 4.5, 10, "BEE-018", "đèn-ngủ-led", 0, 50, "Modern", "NEW", null },
                    { 19, "BeeShop", "Đèn", 14, "Trắng", DateTime.UtcNow, "Đèn ngủ hình tròn cảm nhận chạm để tắt/mở.", "assets/images/den-tron.jpg", "assets/images/den-tron.jpg", true, true, "Nhựa", null, 150000m, "ĐÈN TRÒN CẢM ỨNG", 4.5, 10, "BEE-019", "đèn-tròn-cảm-ứng", 0, 50, "Modern", "NEW", null },
                    { 20, "BeeShop", "Bàn ăn", 1, "Họa tiết", DateTime.UtcNow, "Đĩa gốm sứ với họa tiết vẽ tay đặc sắc cho bàn ăn thêm sinh động.", "assets/images/dia-gom.jpg", "assets/images/dia-gom.jpg", true, true, "Gốm sứ", null, 130000m, "ĐĨA GỐM DECOR", 4.5, 10, "BEE-020", "đĩa-gốm-decor", 0, 50, "Minimal", "NEW", null },
                    { 21, "BeeShop", "Bàn ăn", 1, "Trắng", DateTime.UtcNow, "Đĩa kích thước nhỏ dành cho gia vị hoặc đồ ăn nhẹ.", "assets/images/dia-nho.jpg", "assets/images/dia-nho.jpg", true, true, "Sứ", null, 45000m, "ĐĨA GỐM NHỎ", 4.5, 10, "BEE-021", "đĩa-gốm-nhỏ", 0, 50, "Minimal", "NEW", null },
                    { 22, "BeeShop", "Trang trí tường", 12, "Gỗ vân", DateTime.UtcNow, "Đồng hồ treo tường vân gỗ, thiết kế hiện đại sang trọng.", "assets/images/dong-ho.jpg", "assets/images/dong-ho.jpg", true, true, "Gỗ + Kính", null, 320000m, "ĐỒNG HỒ GỖ CAO CẤP", 4.5, 10, "BEE-022", "đồng-hồ-gỗ-cao-cấp", 0, 50, "Modern", "NEW", null },
                    { 23, "BeeShop", "Trang trí tường", 12, "Hiện đại", DateTime.UtcNow, "Đồng hồ mini thiết kế độc đáo dùng cho góc làm việc nhỏ.", "assets/images/dong-ho-mini.jpg", "assets/images/dong-ho-mini.jpg", true, true, "Nhựa cứng", null, 110000m, "ĐỒNG HỒ MINI", 4.5, 10, "BEE-023", "đồng-hồ-mini", 0, 50, "Minimal", "NEW", null },
                    { 24, "BeeShop", "Trang trí", 11, "Trắng", DateTime.UtcNow, "Dreamcatcher thủ công mang đậm phong cách Boho tự do.", "assets/images/dreamcatcher.jpg", "assets/images/dreamcatcher.jpg", true, true, "Vải + Lông vũ", null, 150000m, "DREAMCATCHER BOHO", 4.5, 10, "BEE-024", "dreamcatcher-boho", 0, 50, "Boho", "NEW", null },
                    { 25, "BeeShop", "Nội thất", 6, "Gỗ sáng", DateTime.UtcNow, "Giá sách gỗ mini dùng trang trí bàn học thêm gọn gàng.", "assets/images/gia-sach.jpg", "assets/images/gia-sach.jpg", true, true, "Gỗ", null, 190000m, "GIÁ SÁCH TỐI GIẢN", 4.5, 10, "BEE-025", "giá-sách-tối-giản", 0, 50, "Minimal", "NEW", null },
                    { 26, "BeeShop", "Nội thất", 6, "Gỗ", DateTime.UtcNow, "Giá sách treo tường giúp tiết kiệm không gian diện tích mặt sàn.", "assets/images/gia-sach-treo.jpg", "assets/images/gia-sach-treo.jpg", true, true, "Gỗ", null, 280000m, "GIÁ SÁCH TREO TƯỜNG", 4.5, 10, "BEE-026", "giá-sách-treo-tường", 0, 50, "Modern", "NEW", null },
                    { 27, "BeeShop", "Nội thất", 6, "Kim loại", DateTime.UtcNow, "Giá treo quần áo phong cách hiện đại, bền bỉ và chịu lực tốt.", "assets/images/gia-treo.jpg", "assets/images/gia-treo.jpg", true, true, "Kim loại sơn tĩnh điện", null, 450000m, "GIÁ TREO ĐỒ CHẤT LƯỢNG", 4.5, 10, "BEE-027", "giá-treo-đồ-chất-lượng", 0, 50, "Modern", "NEW", null },
                    { 28, "BeeShop", "Phụ kiện", 7, "Inox", DateTime.UtcNow, "Giá treo khăn mặt/khăn tắm tiện lợi lắp đặt trong nhà vệ sinh.", "assets/images/gia-treo-khan.jpg", "assets/images/gia-treo-khan.jpg", true, true, "Inox 304", null, 85000m, "GIÁ TREO KHĂN INOX", 4.5, 10, "BEE-028", "giá-treo-khăn-inox", 0, 50, "Clean", "NEW", null },
                    { 29, "BeeShop", "Trang trí", 11, "Mây", DateTime.UtcNow, "Giỏ cây đan mây tre phối cây nhân tạo mang lại cảm giác dễ chịu.", "assets/images/gio-cay.jpg", "assets/images/gio-cay.jpg", true, true, "Mây tre", null, 95000m, "GIỎ CÂY TREO DECOR", 4.5, 10, "BEE-029", "giỏ-cây-treo-decor", 0, 50, "Natural", "NEW", null },
                    { 30, "BeeShop", "Phụ kiện", 7, "Vải", DateTime.UtcNow, "Giỏ vải đựng đồ đa năng, có thể gấp gọn khi không sử dụng.", "assets/images/gio-dung-do.jpg", "assets/images/gio-dung-do.jpg", true, true, "Vải Canvas", null, 120000m, "GIỎ ĐỰNG ĐỒ VERSATILE", 4.5, 10, "BEE-030", "giỏ-đựng-đồ-versatile", 0, 50, "Minimal", "NEW", null },
                    { 31, "BeeShop", "Mây tre đan", 5, "Nâu", DateTime.UtcNow, "Giỏ mây tre đan kích thước lớn dùng đựng quần áo bẩn hoặc vật dụng.", "assets/images/gio-lon.jpg", "assets/images/gio-lon.jpg", true, true, "Mây tre", null, 250000m, "GIỎ MÂY TRE LỚN", 4.5, 10, "BEE-031", "giỏ-mây-tre-lớn", 0, 50, "Rustic", "NEW", null },
                    { 32, "BeeShop", "Mây tre đan", 5, "Mây", DateTime.UtcNow, "Giỏ mây tre truyền thống cho không gian nhà bếp thêm mộc mạc.", "assets/images/gio-may.jpg", "assets/images/gio-may.jpg", true, true, "Tre mây", null, 150000m, "GIỎ MÂY TRUYỀN THỐNG", 4.5, 10, "BEE-032", "giỏ-mây-truyền-thống", 0, 50, "Traditional", "NEW", null },
                    { 33, "BeeShop", "Mây tre đan", 5, "Mây", DateTime.UtcNow, "Giỏ mây mini dễ thương dùng đựng đồ trang sức hoặc đồ nhỏ.", "assets/images/gio-mini.jpg", "assets/images/gio-mini.jpg", true, true, "Mây tre", null, 70000m, "GIỎ MÂY MINI", 4.5, 10, "BEE-033", "giỏ-mây-mini", 0, 50, "Cute", "NEW", null },
                    { 34, "BeeShop", "Mây tre đan", 5, "Trắng", DateTime.UtcNow, "Giỏ đan hình vuông mang phong cách hiện đại và đa năng.", "assets/images/gio-vuong.jpg", "assets/images/gio-vuong.jpg", true, true, "Vải đan", null, 110000m, "GIỎ ĐAN VUÔNG", 4.5, 10, "BEE-034", "giỏ-đan-vuông", 0, 50, "Modern", "NEW", null },
                    { 35, "BeeShop", "Trang trí", 11, "Gương", DateTime.UtcNow, "Gương decor bo viền mượt mà giúp không gian sáng và rộng hơn.", "assets/images/guong-bo-vien.jpg", "assets/images/guong-bo-vien.jpg", true, true, "Kính + Viền nhựa", null, 350000m, "GƯƠNG BO VIỀN", 4.5, 10, "BEE-035", "gương-bo-viền", 0, 50, "Modern", "NEW", null },
                    { 36, "BeeShop", "Trang trí tường", 12, "Gương", DateTime.UtcNow, "Gương tròn treo tường trang trí phòng ngủ hoặc lối ra vào.", "assets/images/guong-tron.jpg", "assets/images/guong-tron.jpg", true, true, "Kính", null, 250000m, "GƯƠNG TRÒN DECOR", 4.5, 10, "BEE-036", "gương-tròn-decor", 0, 50, "Minimal", "NEW", null },
                    { 37, "BeeShop", "Phụ kiện", 7, "N/A", DateTime.UtcNow, "Hộp nhựa dùng đựng đồ cá nhân trang trí, màu sắc trang nhã.", "assets/images/hop-dung.jpg", "assets/images/hop-dung.jpg", true, true, "Nhựa ABS", null, 85000m, "HỘP ĐỰNG ĐỒ TRANG TRÍ", 4.5, 10, "BEE-037", "hộp-đựng-đồ-trang-trí", 0, 50, "Minimal", "NEW", null },
                    { 38, "BeeShop", "Phụ kiện", 7, "Gỗ", DateTime.UtcNow, "Hộp gỗ tự nhiên dùng đựng vật lưu niệm hoặc làm quà tặng.", "assets/images/hop-go.jpg", "assets/images/hop-go.jpg", true, true, "Gỗ thông", null, 130000m, "HỘP GỖ DECOR", 4.5, 10, "BEE-038", "hộp-gỗ-decor", 0, 50, "Rustic", "NEW", null },
                    { 39, "BeeShop", "Nội thất", 6, "Gỗ sáng", DateTime.UtcNow, "Kệ gỗ 2 tầng đa năng cho góc học tập thêm ngăn nắp.", "assets/images/ke-go-2-tang.jpg", "assets/images/ke-go-2-tang.jpg", true, true, "Gỗ tự nhiên", null, 220000m, "KỆ GỖ 2 TẦNG", 4.5, 10, "BEE-039", "kệ-gỗ-2-tầng", 0, 50, "Modern", "NEW", null },
                    { 40, "BeeShop", "Nội thất", 6, "Gỗ", DateTime.UtcNow, "Kệ gỗ chữ L để góc tường tối ưu diện tích trang trí.", "assets/images/ke-go-nho.jpg", "assets/images/ke-go-nho.jpg", true, true, "Gỗ ghép", null, 150000m, "KỆ GỖ NHỎ", 4.5, 10, "BEE-040", "kệ-gỗ-nhỏ", 0, 50, "Minimal", "NEW", null },
                    { 41, "BeeShop", "Nội thất", 6, "Gỗ", DateTime.UtcNow, "Kệ gỗ treo tường đơn giản tạo điểm nhấn cho mảng tường trống.", "assets/images/ke-go-treo.jpg", "assets/images/ke-go-treo.jpg", true, true, "Gỗ", null, 170000m, "KỆ GỖ TREO TƯỜNG", 4.5, 10, "BEE-041", "kệ-gỗ-treo-tường", 0, 50, "Modern", "NEW", null },
                    { 42, "BeeShop", "Nội thất", 6, "Gỗ", DateTime.UtcNow, "Kệ treo mini phù hợp đặt các chậu cây nhỏ xinh.", "assets/images/ke-treo-nho.jpg", "assets/images/ke-treo-nho.jpg", true, true, "Tre/Gỗ", null, 90000m, "KỆ TREO MINI", 4.5, 10, "BEE-042", "kệ-treo-mini", 0, 50, "Natural", "NEW", null },
                    { 43, "BeeShop", "Phụ kiện vải", 8, "Caro", DateTime.UtcNow, "Khăn trải bàn họa tiết caro phong cách Hàn Quốc trẻ trung.", "assets/images/khan-caro.jpg", "assets/images/khan-caro.jpg", true, true, "Cotton", null, 110000m, "KHĂN TRẢI BÀN CARO", 4.5, 10, "BEE-043", "khăn-trải-bàn-caro", 0, 50, "Korean", "NEW", null },
                    { 44, "BeeShop", "Phụ kiện vải", 8, "Họa tiết", DateTime.UtcNow, "Khăn vải hoa nhí tinh tế mang lại vẻ đẹp dịu dàng.", "assets/images/khan-hoa.jpg", "assets/images/khan-hoa.jpg", true, true, "Sợi tổng hợp", null, 95000m, "KHĂN VẢI HOA", 4.5, 10, "BEE-044", "khăn-vải-hoa", 0, 50, "Floral", "NEW", null },
                    { 45, "BeeShop", "Phụ kiện vải", 8, "Mộc", DateTime.UtcNow, "Khăn trải bàn chất liệu Linen mộc mạc và sang trọng.", "assets/images/khan-linen.jpg", "assets/images/khan-linen.jpg", true, true, "Linen", null, 140000m, "KHĂN LINEN CAO CẤP", 4.5, 10, "BEE-045", "khăn-linen-cao-cấp", 0, 50, "Rustic", "NEW", null },
                    { 46, "BeeShop", "Phụ kiện vải", 8, "Trắng", DateTime.UtcNow, "Khăn trải bàn ren trắng tinh khôi cho các buổi tiệc trà.", "assets/images/khan-trang.jpg", "assets/images/khan-trang.jpg", true, true, "Ren/Cotton", null, 120000m, "KHĂN REN TRẮNG", 4.5, 10, "BEE-046", "khăn-ren-trắng", 0, 50, "Pure", "NEW", null },
                    { 47, "BeeShop", "Phụ kiện vải", 8, "Xám", DateTime.UtcNow, "Khăn trải bàn màu xám hiện đại, dễ kết hợp nội thất.", "assets/images/khan-xam.jpg", "assets/images/khan-xam.jpg", true, true, "Cotton", null, 110000m, "KHĂN VẢI XÁM", 4.5, 10, "BEE-047", "khăn-vải-xám", 0, 50, "Modern", "NEW", null },
                    { 48, "BeeShop", "Trang trí", 11, "Gỗ", DateTime.UtcNow, "Khay gỗ trang trí đa năng dùng bày biện đồ decor.", "assets/images/khay-go.jpg", "assets/images/khay-go.jpg", true, true, "Gỗ tự nhiên", null, 135000m, "KHAY GỖ TRANG TRÍ", 4.5, 10, "BEE-048", "khay-gỗ-trang-trí", 0, 50, "Rustic", "NEW", null },
                    { 49, "BeeShop", "Trang trí", 11, "Nhiều màu", DateTime.UtcNow, "Khay lưu trữ nhỏ gọn giúp phân loại các vật dụng cá nhân.", "assets/images/khay-nho.jpg", "assets/images/khay-nho.jpg", true, true, "Nhựa cao cấp", null, 60000m, "KHAY NHỎ ĐA NĂNG", 4.5, 10, "BEE-049", "khay-nhỏ-đa-năng", 0, 50, "Minimal", "NEW", null },
                    { 50, "BeeShop", "Trang trí tường", 12, "Dây xích", DateTime.UtcNow, "Khung ảnh treo bằng dây thừng sáng tạo cho căn phòng thêm cá tính.", "assets/images/khung-anh-day.jpg", "assets/images/khung-anh-day.jpg", true, true, "Gỗ + Dây", null, 120000m, "KHUNG ẢNH TREO DÂY", 4.5, 10, "BEE-050", "khung-ảnh-treo-dây", 0, 50, "Vintage", "NEW", null },
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM Products WHERE ProductId <= 50");
            migrationBuilder.Sql("DELETE FROM Categories WHERE Id <= 15");
        }
    }
}
