# Assignment: Kiểm thử chức năng Bộ lọc khoảng giá sản phẩm (Client)

## 1. Mô tả bài toán
Hệ thống BeeShop cho phép khách hàng lọc sản phẩm theo khoảng giá bằng cách nhập giá trị vào ô "Từ" (Giá tối thiểu) và ô "Đến" (Giá tối đa).

Một yêu cầu lọc giá được xem là **hợp lệ** khi tất cả các điều kiện sau đồng thời thỏa mãn:
- `giaTu`: Số nguyên, từ 1,000đ đến 50,000,000đ.
- `giaDen`: Số nguyên, từ 1,000đ đến 50,000,000đ.
- Điều kiện logic ràng buộc: `giaTu` <= `giaDen`.

Hệ thống trả về kết quả tìm kiếm tương ứng nếu hợp lệ, ngược lại báo lỗi "Khoảng giá không hợp lệ".

---

## 2. Xác định lớp tương đương

| Biến đầu vào | Lớp hợp lệ | Tag | Lớp không hợp lệ | Tag |
|---|---|---|---|---|
| Giá từ (`giaTu`) | 1,000 ≤ giaTu ≤ 50,000,000 | V1 | giaTu < 1,000 | X1 |
| | | | giaTu > 50,000,000 | X2 |
| Giá đến (`giaDen`) | 1,000 ≤ giaDen ≤ 50,000,000 | V2 | giaDen < 1,000 | X3 |
| | | | giaDen > 50,000,000 | X4 |
| Mối quan hệ | giaTu ≤ giaDen | V3 | giaTu > giaDen | X5 |

---

## 3. Phân tích giá trị biên (Standard BVA)

| Biến đầu vào | min | min+ | nominal | max- | max | Tag biên |
|---|---|---|---|---|---|---|
| Giá từ (`giaTu`) | 1,000 | 2,000 | 500,000 | 49,999,000 | 50,000,000 | B1, B2, B3, B4, B5 |
| Giá đến (`giaDen`) | 1,000 | 2,000 | 2,000,000 | 49,999,000 | 50,000,000 | B6, B7, B8, B9, B10 |

---

## 4. Thiết kế bảng Test Case

| STT | Tên test case | Giá từ (`giaTu`) | Giá đến (`giaDen`) | Kết quả mong đợi | Tag được bao phủ |
|---|---|---|---|---|---|
| 1 | TC01 - Toàn bộ giá trị nominal | 500,000 | 2,000,000 | Hợp lệ | V1, V2, V3, B3, B8 |
| 2 | TC02 - Biên dưới tối thiểu | 1,000 | 1,000 | Hợp lệ (Đúng tại biên dưới) | B1, B6, V1, V2, V3 |
| 3 | TC03 - Biên trên tối đa | 50,000,000 | 50,000,000 | Hợp lệ (Đúng tại biên trên) | B5, B10, V1, V2, V3 |
| 4 | TC04 - Giá từ nhỏ hơn min | 999 | 500,000 | Không hợp lệ (giaTu = 999 < 1000) | X1 |
| 5 | TC05 - Giá từ lớn hơn max | 50,001,000 | 50,001,000 | Không hợp lệ (giaTu > 50,000,000) | X2 |
| 6 | TC06 - Giá đến nhỏ hơn min | 500,000 | 999 | Không hợp lệ (giaDen = 999 < 1000) | X3 |
| 7 | TC07 - Giá đến lớn hơn max | 500,000 | 50,001,000 | Không hợp lệ (giaDen > 50,000,000) | X4 |
| 8 | TC08 - Giá từ lớn hơn Giá đến | 200,000 | 100,000 | Không hợp lệ (giaTu > giaDen) | X5 |
| 9 | TC09 - Giá từ sát biên dưới min+ | 2,000 | 500,000 | Hợp lệ | B2 |
| 10 | TC10 - Giá đến sát biên trên max- | 500,000 | 49,999,000 | Hợp lệ | B9 |