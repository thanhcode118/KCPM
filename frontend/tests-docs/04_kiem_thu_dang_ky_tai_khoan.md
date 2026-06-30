# Assignment: Kiểm thử chức năng Đăng ký tài khoản (Client)

## 1. Mô tả bài toán
Khi người dùng đăng ký tài khoản mới trên BeeShop, hệ thống yêu cầu kiểm định độ dài và định dạng của các trường thông tin mật độ cao:
- `matKhau`: Chuỗi ký tự, độ dài hợp lệ từ 8 đến 32 ký tự.
- `tuoi`: Số nguyên, độ tuổi hợp lệ của người dùng để thực hiện hành vi mua sắm trực tuyến theo quy định từ 15 đến 100 tuổi.

---

## 2. Xác định lớp tương đương

| Biến đầu vào | Lớp hợp lệ | Tag | Lớp không hợp lệ | Tag |
|---|---|---|---|---|
| Độ dài mật khẩu (`matKhau`) | 8 ≤ độ dài ≤ 32 | V1 | độ dài < 8 | X1 |
| | | | độ dài > 32 | X2 |
| Tuổi người dùng (`tuoi`) | 15 ≤ tuoi ≤ 100 | V2 | tuoi < 15 | X3 |
| | | | tuoi > 100 | X4 |

---

## 3. Phân tích giá trị biên (Standard BVA)

| Biến đầu vào | min | min+ | nominal | max- | max | Tag biên |
|---|---|---|---|---|---|---|
| Độ dài mật khẩu | 8 | 9 | 16 | 31 | 32 | B1, B2, B3, B4, B5 |
| Tuổi người dùng | 15 | 16 | 25 | 99 | 100 | B6, B7, B8, B9, B10 |

---

## 4. Thiết kế bảng Test Case

| STT | Tên test case | Độ dài mật khẩu | Tuổi người dùng | Kết quả mong đợi | Tag được bao phủ |
|---|---|---|---|---|---|
| 1 | TC01 - Toàn bộ giá trị nominal | 16 (chuỗi mẫu) | 25 | Hợp lệ | V1, V2, B3, B8 |
| 2 | TC02 - Biên dưới tối thiểu | 8 | 15 | Hợp lệ (Vừa đủ điều kiện) | B1, B6, V1, V2 |
| 3 | TC03 - Biên trên tối đa | 32 | 100 | Hợp lệ (Đạt mốc trần) | B5, B10, V1, V2 |
| 4 | TC04 - Mật khẩu quá ngắn | 7 | 25 | Không hợp lệ (Độ dài = 7 < 8) | X1 |
| 5 | TC05 - Mật khẩu quá dài | 33 | 25 | Không hợp lệ (Độ dài = 33 > 32) | X2 |
| 6 | TC06 - Người dùng chưa đủ tuổi | 16 | 14 | Không hợp lệ (tuoi = 14 < 15) | X3 |
| 7 | TC07 - Tuổi vượt mức giới hạn | 16 | 101 | Không hợp lệ (tuoi = 101 > 100) | X4 |
| 8 | TC08 - Độ dài mật khẩu tại min+ | 9 | 25 | Hợp lệ | B2 |
| 9 | TC09 - Tuổi người dùng tại max- | 16 | 99 | Hợp lệ | B9 |