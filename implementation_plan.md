# Kế hoạch Triển khai Tích hợp Tự động hóa Jenkins (CI/CD) & Đồng bộ Trạng thái Jira

Chúng tôi đề xuất kế hoạch chi tiết để thiết lập hệ thống tự động hóa kiểm thử liên tục (CI/CD) bằng **Jenkins Pipeline** và tích hợp quy trình đồng bộ hóa trạng thái của các tính năng lên **Jira Software** cho dự án `HomeDecorShop`.

---

## 1. Tự động hóa CI/CD với Jenkins Pipeline

File [Jenkinsfile](file:///c:/Users/LENOVO/Downloads/GIT/KCPM/Jenkinsfile) hiện tại đang sử dụng các lệnh Unix (`sh`) và chạy build Docker. Đối với môi trường máy cá nhân chạy Windows của bạn, chúng tôi đề xuất tối ưu hóa để Pipeline hoạt động ổn định trực tiếp trên **Windows Agent** (sử dụng các lệnh PowerShell/CMD thông qua `powershell` hoặc `bat`) và hỗ trợ khởi chạy backend cục bộ nhanh chóng mà không bắt buộc cài đặt Docker.

### Đề xuất Cấu trúc Jenkins Pipeline Tối ưu trên Windows:
1. **Stage 1: Checkout Code** (Tải mã nguồn mới nhất từ Git).
2. **Stage 2: Run Unit Tests** (Chạy 94 bộ Unit Test C# thông qua `dotnet test`).
3. **Stage 3: Start Backend App** (Khởi chạy backend trong chế độ chạy ngầm trên port `5020` bằng lệnh `dotnet run --launch-profile http`).
4. **Stage 4: Wait for Server Ready** (Đợi port `5020` sẵn sàng phản hồi kết nối).
5. **Stage 5: Run Newman Integration Tests** (Chạy bộ Newman gồm 10 API và 14 assertions trên file [HomeDecorShop_Postman.json](file:///c:/Users/LENOVO/Downloads/GIT/KCPM/HomeDecorShop/HomeDecorShop_Postman.json)).
6. **Stage 6: Jira & Build Notification** (Thông báo kết quả build và tự động cập nhật trạng thái Ticket trên Jira).
7. **Post-execution (Cleanup)**: Tự động tắt tiến trình backend ngầm để giải phóng cổng `5020`.

---

## 2. Quy trình Đồng bộ hóa Từng Chức năng lên Jira

Để quản lý dự án hiệu quả, mỗi chức năng (Auth, Products, Cart, Orders...) sẽ tương ứng với một **Jira Issue (Ticket)** (ví dụ: `HDS-101`, `HDS-102`...). Chúng tôi đề xuất 2 phương án tích hợp:

### Phương án A: Tự động hóa thông qua Commit Message chuẩn Git (Khuyên dùng - Rất nhanh & Dễ dùng)
Bạn không cần lập trình Jenkins phức tạp, chỉ cần kết nối GitHub/GitLab với Jira Cloud thông qua Jira DVCS Connector.
* **Quy trình hoạt động**:
  * Khi bạn push code hoặc tạo Pull Request, chỉ cần viết mã Ticket Jira ở đầu Commit Message.
  * **Cú pháp commit**: `[HDS-101] Viet unit test va postman cho tinh nang Auth`
  * Hệ thống sẽ tự động liên kết mã commit, file thay đổi vào trong đúng Ticket Jira tương ứng, và tự chuyển trạng thái của ticket từ `To Do` $\rightarrow$ `In Progress` $\rightarrow$ `Done` khi nhánh code được merge.

### Phương án B: Tự động cập nhật qua Jenkins Stage (Sử dụng REST API của Jira)
Nếu muốn Jenkins tự động chuyển trạng thái Ticket Jira sang "READY FOR TESTING" hoặc "DONE" ngay khi pipeline kiểm thử chạy thành công:
* **Cách thực hiện**:
  * Chúng ta sẽ cấu hình một Stage trong `Jenkinsfile` để gửi HTTP POST request trực tiếp đến Jira API bằng API Token cá nhân của bạn.
  * Pipeline sẽ tự động trích xuất mã Ticket Jira từ commit message gần nhất, sau đó gửi API chuyển đổi trạng thái của Ticket đó trên Jira.

---

## 3. Dự thảo Thay đổi Cụ thể trong Mã nguồn

### [MODIFY] [Jenkinsfile](file:///c:/Users/LENOVO/Downloads/GIT/KCPM/Jenkinsfile)
Cập nhật file Jenkinsfile tương thích tốt nhất với hệ điều hành Windows, bao gồm:
* Khởi chạy ứng dụng backend ngầm.
* Chờ port `5020` hoạt động.
* Chạy Newman cục bộ thông qua powershell/cmd.
* Thêm bước tương tác REST API với Jira để cập nhật trạng thái lỗi/thành công.

---

## 4. Kế hoạch Xác minh & Chạy thử

### Kiểm tra Cục bộ (Local Verification)
1. **Kiểm tra Jenkinsfile**: Cấu hình Pipeline trên server Jenkins local chạy Windows, kích hoạt Build và theo dõi Console Log.
2. **Kiểm tra Jira API**: Chạy thử một lệnh PowerShell gửi API test thử xem Jira Cloud có nhận diện và cập nhật đúng Ticket hay không.

---

> [!IMPORTANT]
> ### Ý kiến của bạn về Kế hoạch này?
> 1. Bạn muốn thiết lập Jenkinsfile chạy theo kiểu **cục bộ (dotnet run trực tiếp trên Windows Agent)** hay chạy qua **Docker Container** (như thiết lập cũ trong Jenkinsfile của bạn)?
> 2. Bạn muốn tích hợp trạng thái Jira theo **Phương án A (Sử dụng commit message Git để tự động liên kết)** hay **Phương án B (Dùng REST API của Jenkins viết trong stage để cập nhật trạng thái)**?
>
> Vui lòng phản hồi ý kiến của bạn để tôi tiến hành bắt tay vào chỉnh sửa Jenkinsfile và viết hướng dẫn chi tiết nhất cho bạn!
