# Assignment: Kiểm thử số dư khi Thanh toán qua Ví điện tử (Client)

## 1. Mô tả bài toán
Tại bước thanh toán đơn hàng bằng cổng Ví điện tử liên kết (Ví dụ: BeePay):
- `soDuVi`: Số thực/Số nguyên, số tiền hiện có trong ví của khách hàng. Miền giá trị từ 0đ đến 100,000,000đ.
- `soTienThanhToan`: Số nguyên, tổng số tiền cuối cùng của đơn hàng cần trả. Miền giá trị từ 10,000đ đến 50,000,000đ.
- Điều kiện ràng buộc giao dịch: `soDuVi` >= `soTienThanhToan`.

---

## 2. Xác định lớp tương đương

| Biến đầu vào | Lớp hợp lệ | Tag | Lớp không hợp lệ | Tag |
|---|---|---|---|---|
| Số dư ví (`soDuVi`) | 0 ≤ soDuVi ≤ 100,000,000 | V1 | soDuVi < 0 | X1 |
| | | | soDuVi > 100,000,000 | X2 |
| Số tiền thanh toán (`soTienThanhToan`) | 10,000 ≤ soTienThanhToan ≤ 50,000,000 | V2 | soTienThanhToan < 10,000 | X3 |
| | | | soTienThanhToan > 50,000,000 | X4 |
| Ràng buộc tài chính | soDuVi ≥ soTienThanhToan | V3 | soDuVi < soTienThanhToan | X5 |

---

## 3. Phân tích giá trị biên (Standard BVA)

| Biến đầu vào | min | min+ | nominal | max- | max | Tag biên |
|---|---|---|---|---|---|---|
| Số dư ví (`soDuVi`) | 0 | 10,000 | 5,000,000 | 99,900,000 | 100,000,000 | B1, B2, B3, B4, B5 |
| Số tiền thanh toán | 10,000 | 20,000 | 1,000,000 | 49,990,000 | 50,000,000 | B6, B7, B8, B9, B10 |

---

## 4. Thiết kế bảng Test Case

| STT | Tên test case | Số dư ví (`soDuVi`) | Số tiền thanh toán | Kết quả mong đợi | Tag được bao phủ |
|---|---|---|---|---|---|
| 1 | TC01 - Toàn bộ giá trị nominal | 5,000,000 | 1,000,000 | Hợp lệ (Giao dịch thành công) | V1, V2, V3, B3, B8 |
| 2 | TC02 - Vừa đủ tiền mua | 500,000 | 500,000 | Hợp lệ (Giao dịch thành công, ví về 0đ) | V1, V2, V3 |
| 3 | TC03 - Số dư ví âm | -5,000 | 100,000 | Không hợp lệ (soDuVi < 0) | X1 |
| 4 | TC04 - Ví vượt định mức lưu trữ | 100,001,000 | 500,000 | Không hợp lệ (soDuVi > max) | X2 |
| 5 | TC05 - Đơn hàng dưới mức sàn | 500,000 | 5,000 | Không hợp lệ (soTienThanhToan < 10k) | X3 |
| 6 | TC06 - Đơn hàng vượt mức trần | 60,000,000 | 50,010,000 | Không hợp lệ (soTienThanhToan > 50M) | X4 |
| 7 | TC07 - Ví không đủ tiền thanh toán| 150,000 | 200,000 | Không hợp lệ (soDuVi < soTienThanhToan) | X5 |
| 8 | TC08 - Đơn hàng tại biên max | 60,000,000 | 50,000,000 | Hợp lệ | B10 |