# Assignment: Kiểm thử logic áp dụng Mã giảm giá - Coupon (Client)

## 1. Mô tả bài toán
Khi khách hàng áp dụng mã Coupon tại trang thanh toán của BeeShop, mã chỉ có hiệu lực khi giá trị đơn hàng đạt mức tối thiểu quy định:
- `tongDonHang`: Số nguyên, tổng tiền trước giảm giá. Miền giá trị từ 10,000đ đến 200,000,000đ.
- `dieuKienMin`: Số nguyên, mức chi tiêu tối thiểu để kích hoạt mã giảm giá cụ thể (Giả định mã giảm giá `BEE2026` yêu cầu đơn hàng từ 200,000đ trở lên).
- Điều kiện hợp lệ: `tongDonHang` >= `dieuKienMin`.

---

## 2. Xác định lớp tương đương

| Biến đầu vào | Lớp hợp lệ | Tag | Lớp không hợp lệ | Tag |
|---|---|---|---|---|
| Tổng đơn hàng (`tongDonHang`) | 10,000 ≤ tongDonHang ≤ 200,000,000 | V1 | tongDonHang < 10,000 | X1 |
| | | | tongDonHang > 200,000,000 | X2 |
| Mối quan hệ Coupon | tongDonHang ≥ dieuKienMin (200,000) | V2 | tongDonHang < dieuKienMin (200,000) | X3 |

---

## 3. Phân tích giá trị biên (Standard BVA)

| Biến đầu vào | min | min+ | nominal | max- | max | Tag biên |
|---|---|---|---|---|---|---|
| Tổng đơn hàng | 10,000 | 20,000 | 500,000 | 199,990,000 | 200,000,000 | B1, B2, B3, B4, B5 |

*Lưu ý: Điểm biên cục bộ do logic Coupon sinh ra nằm ở mốc `200,000` đ.*

---

## 4. Thiết kế bảng Test Case

| STT | Tên test case | Tổng đơn hàng | Mức tối thiểu mã yêu cầu | Kết quả mong đợi | Tag được bao phủ |
|---|---|---|---|---|---|
| 1 | TC01 - Giá trị nominal | 500,000 | 200,000 | Hợp lệ (Áp dụng thành công) | V1, V2, B3 |
| 2 | TC02 - Đơn hàng tối đa hệ thống | 200,000,000 | 200,000 | Hợp lệ | B5, V1, V2 |
| 3 | TC03 - Đơn hàng dưới min hệ thống | 9,000 | 200,000 | Không hợp lệ (Đơn hàng tối thiểu từ 10k) | X1 |
| 4 | TC04 - Đơn hàng vượt trần hệ thống | 200,010,000 | 200,000 | Không hợp lệ (Vượt hạn mức đơn lẻ) | X2 |
| 5 | TC05 - Đạt vừa đúng biên Coupon | 200,000 | 200,000 | Hợp lệ (Áp dụng thành công) | V1, V2 |
| 6 | TC06 - Thiếu 1 đồng sát biên Coupon| 199,999 | 200,000 | Không hợp lệ (Không đủ điều kiện mã) | X3 |
| 7 | TC07 - Sát biên dưới hệ thống | 10,000 | 200,000 | Không hợp lệ (Thỏa quy tắc hệ thống nhưng thiếu tiền Coupon)| B1, X3 |