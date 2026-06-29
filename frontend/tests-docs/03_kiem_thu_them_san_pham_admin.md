# Assignment: Kiểm thử logic Form Thêm sản phẩm mới (Admin)

## 1. Mô tả bài toán
Trong phân hệ Admin của HomeDecorShop, khi quản trị viên thêm mới một sản phẩm, hai trường thông tin về tài chính và kho vận phải tuân theo quy tắc kiểm định nghiêm ngặt:
- `giaBan`: Số thực (hoặc số nguyên), giá bán sản phẩm ra thị trường. Miền giá trị hợp lệ từ 10,000đ đến 100,000,000đ.
- `giaNhap`: Số thực (hoặc số nguyên), giá vốn nhập kho. Miền giá trị hợp lệ từ 10,000đ đến 100,000,000đ.
- Điều kiện logic ràng buộc thương mại: `giaNhap` < `giaBan` (đảm bảo doanh nghiệp không bán lỗ).

---

## 2. Xác định lớp tương đương

| Biến đầu vào | Lớp hợp lệ | Tag | Lớp không hợp lệ | Tag |
|---|---|---|---|---|
| Giá bán (`giaBan`) | 10,000 ≤ giaBan ≤ 100,000,000 | V1 | giaBan < 10,000 | X1 |
| | | | giaBan > 100,000,000 | X2 |
| Giá nhập (`giaNhap`) | 10,000 ≤ giaNhap ≤ 100,000,000 | V2 | giaNhap < 10,000 | X3 |
| | | | giaNhap > 100,000,000 | X4 |
| Ràng buộc kinh tế | giaNhap < giaBan | V3 | giaNhap ≥ giaBan | X5 |

---

## 3. Phân tích giá trị biên (Standard BVA)

| Biến đầu vào | min | min+ | nominal | max- | max | Tag biên |
|---|---|---|---|---|---|---|
| Giá bán (`giaBan`) | 10,000 | 20,000 | 1,500,000 | 99,990,000 | 100,000,000 | B1, B2, B3, B4, B5 |
| Giá nhập (`giaNhap`) | 10,000 | 20,000 | 800,000 | 99,990,000 | 100,000,000 | B6, B7, B8, B9, B10 |

---

## 4. Thiết kế bảng Test Case

| STT | Tên test case | Giá bán (`giaBan`) | Giá nhập (`giaNhap`) | Kết quả mong đợi | Tag được bao phủ |
|---|---|---|---|---|---|
| 1 | TC01 - Toàn bộ giá trị nominal | 1,500,000 | 800,000 | Hợp lệ | V1, V2, V3, B3, B8 |
| 2 | TC02 - Giá bán tại biên max | 100,000,000 | 50,000,000 | Hợp lệ | B5, V1, V2, V3 |
| 3 | TC03 - Giá nhập tại biên min | 500,000 | 10,000 | Hợp lệ | B6, V1, V2, V3 |
| 4 | TC04 - Giá bán dưới mức min | 9,999 | 5,000 | Không hợp lệ (giaBan < 10,000) | X1 |
| 5 | TC05 - Giá bán vượt mức max | 100,001,000 | 5,000,000 | Không hợp lệ (giaBan > 100,000,000) | X2 |
| 6 | TC06 - Giá nhập dưới mức min | 200,000 | 9,999 | Không hợp lệ (giaNhap < 10,000) | X3 |
| 7 | TC07 - Giá nhập vượt mức max | 5,000,000 | 100,001,000 | Không hợp lệ (giaNhap > 100,000,000) | X4 |
| 8 | TC08 - Giá nhập bằng Giá bán | 500,000 | 500,000 | Không hợp lệ (Bán hòa vốn - Vi phạm giaNhap < giaBan) | X5 |
| 9 | TC09 - Giá nhập lớn hơn Giá bán | 300,000 | 400,000 | Không hợp lệ (Bán lỗ - Vi phạm giaNhap < giaBan) | X5 |
| 10 | TC10 - Giá bán tại biên min+ | 20,000 | 10,000 | Hợp lệ | B2 |