# Assignment: Kiểm thử cơ chế giới hạn số lần Đăng nhập sai (Security)

## 1. Mô tả bài toán
Để bảo mật hệ thống chống lại các cuộc tấn công brute-force, BeeShop triển khai cơ chế đếm số lần đăng nhập thất bại liên tiếp:
- `soLanSai`: Số nguyên, số lần nhập sai mật khẩu liên tiếp của một tài khoản. Miền giá trị từ 0 đến 5 lần.
- Nếu `soLanSai` <= 5: Hệ thống cho phép tiếp tục thử nghiệm và hiển thị cảnh báo.
- Nếu `soLanSai` > 5: Hệ thống lập tức khóa tài khoản tạm thời trong 15 phút.

---

## 2. Xác định lớp tương đương

| Biến đầu vào | Lớp hợp lệ (Không khóa) | Tag | Lớp không hợp lệ (Bị khóa) | Tag |
|---|---|---|---|---|
| Số lần sai (`soLanSai`) | 0 ≤ soLanSai ≤ 5 | V1 | soLanSai < 0 (Vô lý) | X1 |
| | | | soLanSai > 5 | X2 |

---

## 3. Phân tích giá trị biên (Standard BVA)

| Biến đầu vào | min | min+ | nominal | max- | max | Tag biên |
|---|---|---|---|---|---|---|
| Số lần sai (`soLanSai`) | 0 | 1 | 3 | 4 | 5 | B1, B2, B3, B4, B5 |

---

## 4. Thiết kế bảng Test Case

| STT | Tên test case | Số lần đăng nhập sai | Kết quả mong đợi | Tag được bao phủ |
|---|---|---|---|---|
| 1 | TC01 - Trạng thái nominal | 3 | Hợp lệ (Cho phép đăng nhập, báo sai mật khẩu) | V1, B3 |
| 2 | TC02 - Tài khoản mới tinh | 0 | Hợp lệ (Chưa từng sai) | B1, V1 |
| 3 | TC03 - Chạm mốc nguy hiểm | 5 | Hợp lệ (Lần thử cuối cùng trước khi khóa) | B5, V1 |
| 4 | TC04 - Vượt ngưỡng giới hạn | 6 | Không hợp lệ (Khóa tài khoản 15 phút) | X2 |
| 5 | TC05 - Nhập sai số âm | -1 | Không hợp lệ (Dữ liệu hệ thống lỗi) | X1 |
| 6 | TC06 - Sai lần đầu tiên (min+) | 1 | Hợp lệ | B2 |
| 7 | TC07 - Sắp chạm trần (max-) | 4 | Hợp lệ | B4 |