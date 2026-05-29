# Huong Dan Chay

## Terminal 1 - Clone source

```powershell
git clone 
cd TMDT_Nhom6
```

## Terminal 2 - Start SQL Server

```powershell
docker compose -f docker-compose.sql.yml up -d
docker compose -f docker-compose.sql.yml ps
```

## Terminal 3 - Start Backend
C:\WORK_SPACE\NEW_KCPM\KCPM\HomeDecorShop\HomeDecorShop.API
dotnet run
```

## Terminal 4 - Seed du lieu

```powershell
Invoke-RestMethod -Method Post http://localhost:5020/api/Maintenance/seed/all
```

## Terminal 5 - Start Frontend
C:\WORK_SPACE\NEW_KCPM\KCPM\frontend
npm install
npm run dev
```

## Terminal 6 - Start ngrok

```powershell
ngrok config add-authtoken 3CHqDga7M0o27PcWJWmERTM55E1_5mfBKdmVUCZ5fj9QnR8FN


ngrok http --domain=gecko-canning-viability.ngrok-free.dev 5020

Ngân hàng: NCB
Số thẻ: 9704198526191432198
Tên chủ thẻ: NGUYEN VAN A
Ngày phát hành: 07/15
Mã OTP: 123456

## URL

```text
Frontend: http://127.0.0.1:3000
Backend: http://localhost:5020
Swagger: http://localhost:5020/swagger
```


## auto-test
```text
newman run HomeDecorShop/HomeDecorShop_Postman.json --env-var "url=http://localhost:5020"
```

npm install -g newman newman-reporter-html newman-reporter-junit
admin:12345678 jenkins
http://localhost:8080/pluginManager/available


Chào bạn! Tôi sẽ hướng dẫn bạn cực kỳ chi tiết từng bước, click chuột vào đâu từ giao diện Dashboard chính để hoàn thành nhé.

Bạn hãy làm theo các bước click chuột dưới đây:

---

### BƯỚC 1: Cài đặt Plugins (Để Jenkins có đầy đủ tính năng biên dịch và chạy kiểm thử)



1. **Vào trang quản trị:** Tại màn hình Dashboard chính, bạn nhìn sang **cột menu bên trái**, click chuột vào dòng **`Manage Jenkins`** (Quản lý Jenkins - có biểu tượng hình bánh răng ⚙️).
2. **Vào mục Plugins:** Tại trang cấu hình vừa mở ra, bạn cuộn xuống một chút và click chuột vào ô **`Plugins`** (Tiện ích mở rộng).
3. **Mở kho plugin:** Tại trang Plugins, nhìn vào menu bên trái, click chuột vào dòng **`Available plugins`** (Plugin có sẵn).
4. **Tìm kiếm và tích chọn 4 plugin sau:**
   * Nhìn sang ô **Search** (Tìm kiếm) ở góc trên bên phải:
     * Gõ chữ: **`Pipeline`** $\rightarrow$ Nhìn xuống danh sách bên dưới, **tích chọn vào ô vuông** trước chữ **Pipeline**.
     * Xóa chữ cũ đi, gõ chữ: **`Git`** $\rightarrow$ **Tích chọn vào ô vuông** trước chữ **Git**.
     * Xóa chữ cũ đi, gõ chữ: **`MSTest`** $\rightarrow$ **Tích chọn vào ô vuông** trước chữ **MSTest**.
     * Xóa chữ cũ đi, gõ chữ: **`HTML Publisher`** $\rightarrow$ **Tích chọn vào ô vuông** trước chữ **HTML Publisher**.
5. **Kích hoạt cài đặt:** Sau khi tích chọn xong cả 4 cái, bạn cuộn xuống dưới cùng trang web đó, click chuột vào nút **`Install`** (Cài đặt).
6. **Đợi tải xong:** Bạn sẽ thấy trang tiến trình tải tự động chạy. Chờ khoảng 1 phút cho đến khi tất cả các dòng hiển thị trạng thái màu xanh lá cây là **`Success`** (Thành công).

---

### BƯỚC 2: Tạo dự án Pipeline kiểm thử đầu tiên

Sau khi cài đặt xong plugins ở Bước 1, bạn nhấp chuột vào chữ **`Dashboard`** ở góc trên cùng bên trái màn hình trình duyệt để quay lại trang chủ.

1. **Tạo Job mới:** Ở menu bên trái trang Dashboard, click chuột vào **`New Item`** (Mục mới - có biểu tượng dấu cộng ➕).
2. **Nhập tên dự án:** Tại ô *Enter an item name*, bạn gõ tên: **`HomeDecorShop-CI`** (viết liền không dấu).
3. **Chọn kiểu dự án:** Click chuột chọn dòng **`Pipeline`** (Đường ống) ở danh sách bên dưới.
4. Click nút **`OK`** ở dưới cùng.

---

### BƯỚC 3: Cấu hình để Jenkins đọc file Jenkinsfile của bạn

Màn hình cấu hình dự án sẽ hiện ra. Bạn hãy cuộn chuột xuống dưới cùng của trang, tìm đến mục mang tên **`Pipeline`**:

1. **Definition** (Định nghĩa): Click vào ô lựa chọn và chọn dòng **`Pipeline script from SCM`** (Script đường ống từ quản lý mã nguồn).
2. **SCM**: Click chọn **`Git`**.
3. **Repository URL**: Bạn sao chép và dán chính xác đường dẫn thư mục code trên máy của bạn vào ô này:
   ```text
   c:\Users\LENOVO\Downloads\GIT\KCPM
   ```
4. **Branch Specifier** (Tên nhánh): Mặc định đang hiển thị là `*/master`. Bạn đổi chữ `master` thành chữ `main` để khớp với nhánh chứa code của bạn:
   ```text
   */main
   ```
5. **Script Path** (Đường dẫn file chạy): Đảm bảo ô này đang ghi đúng chữ: **`Jenkinsfile`**
6. Nhấp chuột vào nút **`Save`** (Lưu) màu xanh ở góc dưới cùng bên trái.

---

### BƯỚC 4: Bắt đầu chạy tự động hóa! 🚀

Sau khi nhấn Save, bạn sẽ được đưa đến màn hình của dự án `HomeDecorShop-CI`.

1. Click chuột vào nút **`Build Now`** (Xây dựng ngay) ở menu bên trái.
2. Bạn sẽ thấy một bản build mang số **`#1`** xuất hiện dưới mục **Build History** (Lịch sử xây dựng) ở góc trái dưới cùng kèm theo vòng tròn nhấp nháy.
3. Click chuột vào số **`#1`** đó -> Chọn **`Console Output`** (Đầu ra bảng điều khiển) để xem Jenkins tự động chạy code, chạy test xUnit và Newman API Test cho bạn trực tiếp trên màn hình!

Bạn hãy làm theo từng click chuột này nhé. Nếu gặp vướng mắc ở click nào, hãy chụp ảnh hoặc mô tả lại để tôi hỗ trợ bạn ngay lập tức!