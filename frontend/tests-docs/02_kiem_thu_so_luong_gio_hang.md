# Assignment: Kiểm thử logic số lượng sản phẩm trong Giỏ hàng (Client)

## 1. Mô tả bài toán
Trong phân hệ Giỏ hàng của BeeShop, khi khách hàng thực hiện thay đổi số lượng của một mặt hàng bằng cách nhập số hoặc bấm nút tăng (`+`) / giảm (`-`), hệ thống áp dụng các quy tắc sau:
- `soLuong`: Số nguyên, số lượng muốn mua cho mỗi sản phẩm. Miền giá trị từ 1 đến 50 (giới hạn tối đa cho một đơn hàng bán lẻ).
- `khoTon`: Số nguyên, số lượng sản phẩm thực tế còn lại trong kho của hệ thống. Miền giá trị từ 0 đến 200.
- Điều kiện ràng buộc: `soLuong` <= `khoTon`.

---

## 2. Xác định lớp tương đương

| Biến đầu vào | Lớp hợp lệ | Tag | Lớp không hợp lệ | Tag |
|---|---|---|---|---|
| Số lượng mua (`soLuong`) | 1 ≤ soLuong ≤ 50 | V1 | soLuong < 1 | X1 |
| | | | soLuong > 50 | X2 |
| Kho tồn hiện tại (`khoTon`) | 0 ≤ khoTon ≤ 200 | V2 | khoTon < 0 | X3 |
| | | | khoTon > 200 | X4 |
| Mối quan hệ | soLuong ≤ khoTon | V3 | soLuong > khoTon | X5 |

---

## 3. Phân tích giá trị biên (Standard BVA)

| Biến đầu vào | min | min+ | nominal | max- | max | Tag biên |
|---|---|---|---|---|---|---|
| Số lượng mua (`soLuong`) | 1 | 2 | 5 | 49 | 50 | B1, B2, B3, B4, B5 |
| Kho tồn hiện tại (`khoTon`) | 0 | 1 | 100 | 199 | 200 | B6, B7, B8, B9, B10 |

---

## 4. Thiết kế bảng Test Case

| STT | Tên test case | Số lượng mua (`soLuong`) | Kho tồn hiện tại (`khoTon`) | Kết quả mong đợi | Tag được bao phủ |
|---|---|---|---|---|---|
| 1 | TC01 - Toàn bộ giá trị nominal | 5 | 100 | Hợp lệ | V1, V2, V3, B3, B8 |
| 2 | TC02 - Biên tối thiểu hợp lệ | 1 | 1 | Hợp lệ (Sức mua tối thiểu) | B1, B7, V1, V2, V3 |
| 3 | TC03 - Biên tối đa giới hạn | 50 | 50 | Hợp lệ (Đạt mốc trần hệ thống) | B5, V1, V3 |
| 4 | TC04 - Số lượng mua bằng 0 | 0 | 100 | Không hợp lệ (soLuong = 0 < 1) | X1 |
| 5 | TC05 - Số lượng vượt mức trần | 51 | 100 | Không hợp lệ (soLuong = 51 > 50) | X2 |
| 6 | TC06 - Kho tồn âm | 5 | -1 | Không hợp lệ (khoTon = -1 < 0) | X3 |
| 7 | TC07 - Kho tồn vượt quá định mức | 5 | 201 | Không hợp lệ (khoTon = 201 > 200) | X4 |
| 8 | TC08 - Số lượng mua vượt kho tồn | 20 | 10 | Không hợp lệ (soLuong > khoTon) | X5 |
| 9 | TC09 - Số lượng mua tại min+ | 2 | 100 | Hợp lệ | B2 |
| 10 | TC10 - Số lượng mua tại max- | 49 | 100 | Hợp lệ | B4 |