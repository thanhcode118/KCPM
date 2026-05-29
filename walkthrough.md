## 1. Các thay đổi đã thực hiện (Changes Made)

1. **[NEW] [Jenkinsfile](file:///c:/Users/LENOVO/Downloads/GIT/KCPM/Jenkinsfile)**: File cấu hình Declarative Pipeline tối ưu cho Windows Agent.
   * Tự động khôi phục và biên dịch Solution .NET 9.0.
   * Tự động chạy toàn bộ xUnit Tests và xuất báo cáo kiểm thử dạng `.trx`.
   * Tự động khởi tạo Database thông qua Docker Compose.
   * Tự động khởi chạy ngầm ứng dụng Backend API trên cổng `5020`.
   * **Tự động Seed dữ liệu mẫu (`/api/Maintenance/seed/all`)** để chuẩn bị sẵn dữ liệu sạch trước khi test API.
   * Tự động chạy Newman API Test trên bộ Postman Collection.
   * Tự động thu thập báo cáo JUnit XML và báo cáo HTML Newman tuyệt đẹp.
   * Đảm bảo dọn dẹp các tiến trình ngầm và tắt container sau khi kết thúc build (kể cả khi thất bại).

---

## 2. Hướng dẫn thiết lập trên Jenkins Server (Từng bước)

### Bước 2.1: Cài đặt các công cụ cần thiết trên máy Windows chạy Jenkins
Đảm bảo máy tính chạy Jenkins Agent (hoặc máy local của bạn) đã cài sẵn:
1. **.NET 9.0 SDK**: [Tải về tại đây](https://dotnet.microsoft.com/en-us/download/dotnet/9.0)
2. **Node.js**: [Tải về tại đây](https://nodejs.org/)
3. **Newman** và các plugin sinh báo cáo (chạy lệnh sau trong PowerShell Admin):
   ```powershell
   npm install -g newman newman-reporter-html newman-reporter-junit
   ```
4. **Docker Desktop**: Để khởi động SQL Server phục vụ API test.

### Bước 2.2: Cài đặt Plugins trên Jenkins Dashboard
Đăng nhập vào Jenkins của bạn, truy cập **Manage Jenkins** -> **Plugins** -> **Available Plugins**, tìm kiếm và cài đặt các plugin sau (chọn cài đặt không cần khởi động lại):
* **MSTest Plugin**: Để đọc file kết quả test `.trx` của .NET và vẽ biểu đồ.
* **HTML Publisher Plugin**: Để lưu trữ và hiển thị trực tiếp trang báo cáo HTML Newman đẹp mắt trên giao diện Jenkins.
* **JUnit Plugin**: Phục vụ hiển thị thống kê biểu đồ cho Newman API test.

### Bước 2.3: Tạo và cấu hình Pipeline Job trên Jenkins
1. Tại màn hình chính của Jenkins, chọn **New Item**.
2. Nhập tên dự án (ví dụ: `HomeDecorShop-CI-Windows`) và chọn kiểu **Pipeline** -> nhấn **OK**.
3. Cuộn xuống phần **Pipeline**:
   * **Definition**: Chọn `Pipeline script from SCM`.
   * **SCM**: Chọn `Git`.
   * **Repository URL**: Điền đường dẫn Git của dự án của bạn (ví dụ: `c:\Users\LENOVO\Downloads\GIT\KCPM` hoặc link repository trực tuyến).
   * **Credentials**: Chọn tài khoản Git tương ứng nếu là private repository.
   * **Branch Specifier**: Điền `*/main` hoặc `*/master` (nhánh bạn muốn tự động hóa kiểm thử).
   * **Script Path**: Điền `Jenkinsfile` (đã có sẵn trong repository).
4. Nhấn **Save**.

---

## 3. Vận hành và Kiểm tra Kết quả (Verification Plan)

### Cách chạy thử
1. Trên trang của Job vừa tạo, nhấn vào **Build Now** để bắt đầu kích hoạt quy trình chạy thử.
2. Bạn có thể theo dõi quá trình chạy trực tiếp qua **Console Output** của build.

### Kiểm tra Báo cáo hiển thị trên Jenkins Dashboard
Sau khi pipeline hoàn tất, Jenkins sẽ tự động phân tích và tạo ra các báo cáo trực quan cho bạn:

* **Biểu đồ xu hướng Unit Test (Test Result Trend)**: 
  * Được hiển thị ở cột bên phải trang Job chính. Bạn có thể xem có bao nhiêu test pass, bao nhiêu test fail và thời gian chạy.
  
* **Báo cáo API Test chi tiết (Newman API Integration Report)**:
  * Bên góc trái của trang Build chi tiết sẽ xuất hiện liên kết **Newman API Integration Report**.
  * Bấm vào đây để xem toàn bộ danh sách API, các assertion, thời gian phản hồi và các lỗi chi tiết (nếu có) dưới dạng giao diện HTML hiện đại, trực quan.

---

> [!TIP]
> **Khắc phục lỗi hiển thị HTML trên Jenkins:**
> Theo mặc định, Jenkins áp dụng chính sách bảo mật nội dung (CSP) nghiêm ngặt nên file báo cáo HTML Newman có thể không hiển thị CSS đúng cách. Để mở khóa tính năng này, hãy vào **Manage Jenkins** -> **Script Console** và chạy dòng lệnh sau:
> ```groovy
> System.setProperty("hudson.model.DirectoryBrowserSupport.CSP", "")
> ```
> Sau đó tải lại trang báo cáo HTML của bạn.







Bước 1: Cài đặt môi trường Java JDK 17 (Bắt buộc)
Jenkins được viết trên nền Java nên máy bạn bắt buộc phải có Java để chạy.

Tải và cài đặt trực tiếp bản Java JDK 17 chính thức tại đây: 👉 Tải Java JDK 17 cho Windows

Bước 2: Tải và cài đặt phần mềm Jenkins
Tải bộ cài chính thức dạng .msi dành cho Windows tại đây: 
Lưu ý 1 (Cực kỳ quan trọng): Tại màn hình Service Logon Credentials, bạn nhớ chọn Run service as LocalSystem để tránh bị lỗi phân quyền tập tin trên Windows.
Lưu ý 2 (Chọn Port): Mặc định là cổng 8080, bạn bấm nút Test Port bên cạnh để xem có màu xanh lá cây không (nếu trùng, hãy đổi sang cổng khác như 8082 hoặc 8888).
Lưu ý 3 (Chọn Java): Thư mục cài đặt Java ở Bước 1 thường sẽ được tự động nhận diện. Nếu trống, hãy bấm Browse trỏ vào C:\Program Files\Java\jdk-17.
Bước 3: Đăng nhập kích hoạt Jenkins (Unlock Jenkins)
Khi cài xong, trình duyệt sẽ tự động mở trang web: http://localhost:8080 (hoặc cổng bạn đã chọn ở trên).
Để lấy mật mã mở khóa, bạn mở File Explorer trên Windows, truy cập vào đường dẫn sau:
text
C:\ProgramData\Jenkins\.jenkins\secrets\initialAdminPassword
(Lưu ý: Mở file initialAdminPassword bằng Notepad, copy dòng mật mã bên trong dán vào trình duyệt rồi chọn Continue).
Nhấp chọn Install suggested plugins (Cài đặt các plugin khuyên dùng) và chờ 2 phút để Jenkins tự động tải các plugin nền tảng.
Tạo tài khoản đăng nhập Admin cá nhân của bạn để sử dụng từ nay về sau.