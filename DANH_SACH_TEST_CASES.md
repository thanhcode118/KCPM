# TÀI LIỆU MA TRẬN TEST CASE CHI TIẾT (DECISION TABLES)
## DỰ ÁN: HOMEDECORSHOP

Tài liệu này tổng hợp toàn bộ các kịch bản kiểm thử (Test Cases) dưới dạng **Bảng Quyết Định (Decision Tables / Test Matrix)** theo đúng mẫu thiết kế chuẩn của nhóm. Mỗi bảng biểu diễn các điều kiện đầu vào (Preconditions), kết quả mong muốn (Confirmations/Outputs) và kết quả chạy thực tế (Results) cho từng phân hệ chức năng.

---

## 1. Chức Năng: Đăng Nhập (Auth - Login)

| Thuộc tính | Chi tiết | Thông tin |
| :--- | :--- | :--- |
| **Function Code** | AUTH_LOGIN | **Function Name** | Chức năng đăng nhập hệ thống |
| **Created By** | Tạ Đức Bảo | **Executed By** | Nhóm QC |
| **Lines of code** | 100 | **Lack of test cases** | 0 |

### Bảng tóm tắt kết quả
| Passed | Failed | Untested | N (Normal) | A (Abnormal) | B (Boundary) | Total Test Cases |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 7 | 0 | 0 | 1 | 4 | 2 | 7 |

### Ma trận Test Case
| Phân loại | Điều kiện / Mong muốn | Giá trị đầu vào / đầu ra | UTCID01 | UTCID02 | UTCID03 | UTCID04 | UTCID05 | UTCID06 | UTCID07 |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Condition** | **Precondition** | **username** | | | | | | | |
| | | "quantranhoang24@gmail.com" | O | O | | | | | |
| | | null | | | | | | | |
| | | "abc@com" | | | O | | | | |
| | | "adwadw@gmail.com" | | | | O | O | O | O |
| | | **password** | | | | | | | |
| | | "Quan1109" | O | | | | | | |
| | | "Adawdwd" | | O | | O | O | O | O |
| | | null | | | O | | | | |
| | | **Trạng thái tài khoản** | | | | | | | |
| | | Đang hoạt động (Active) | O | O | | | | | |
| | | Bị khóa (Locked out / Inactive) | | | O | O | O | O | O |
| **Confirm** | **Return** | **Mã phản hồi HTTP** | | | | | | | |
| | | 201 (Hoặc 200 OK) | O | | | O | O | O | O |
| | | 400 (Bad Request) | | O | | | | | |
| | | 403 (Forbidden) | | | O | | | | |
| | | **Log message** | | | | | | | |
| | | "Đăng nhập thành công" | O | | | O | O | O | O |
| | | "Email hoặc mật khẩu không chính xác" | | O | O | | | | |
| | | "Tài khoản của bạn đã bị khóa" | | | | | | | |
| | | "Email không được để trống" | | | | | | | |
| | | "Mật khẩu không được để trống" | | | | | | | |
| | | "Email không đúng định dạng" | | | | | | | |
| **Result** | **Type** | Normal (N) / Abnormal (A) / Boundary (B) | N | B | B | A | A | A | A |
| | **Status** | Passed (P) / Failed (F) | P | P | P | P | P | P | P |
| | **Date** | Ngày chạy thử | 4-Apr | 4-Apr | Nov-23 | Nov-24 | Nov-24 | Nov-24 | Nov-24 |
| | **Defect ID** | Mã lỗi phát sinh | - | - | - | - | - | - | - |

---

## 2. Chức Năng: Đăng Ký Tài Khoản (Auth - Register)

| Thuộc tính | Chi tiết | Thông tin |
| :--- | :--- | :--- |
| **Function Code** | AUTH_REGISTER | **Function Name** | Chức năng đăng ký tài khoản khách hàng |
| **Created By** | Tạ Đức Bảo | **Executed By** | Nhóm QC |
| **Lines of code** | 120 | **Lack of test cases** | 0 |

### Bảng tóm tắt kết quả
| Passed | Failed | Untested | N (Normal) | A (Abnormal) | B (Boundary) | Total Test Cases |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 6 | 0 | 0 | 1 | 3 | 2 | 6 |

### Ma trận Test Case
| Phân loại | Điều kiện / Mong muốn | Giá trị đầu vào / đầu ra | UTCID01 | UTCID02 | UTCID03 | UTCID04 | UTCID05 | UTCID06 |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Condition** | **Precondition** | **Email** | | | | | | |
| | | "newuser@example.com" (Mới, hợp lệ) | O | | | | | |
| | | "existing@example.com" (Đã tồn tại) | | O | | | | |
| | | null / Trống | | | O | | | |
| | | "invalid-email-format" (Sai định dạng) | | | | O | | |
| | | **Mật khẩu (Password)** | | | | | | |
| | | "ValidPass123" (Hợp lệ, từ 6 kí tự) | O | O | | O | | |
| | | "short" (Quá ngắn, dưới 6 kí tự) | | | | | O | |
| | | null / Trống | | | | | | O |
| **Confirm** | **Return** | **Mã phản hồi HTTP** | | | | | | |
| | | 201 (Created) | O | | | | | |
| | | 400 (Bad Request) | | | O | O | O | O |
| | | 409 (Conflict) | | O | | | | |
| | | **Log message** | | | | | | |
| | | "Đăng ký thành công, vui lòng xác nhận email" | O | | | | | |
| | | "Email đã tồn tại trong hệ thống" | | O | | | | |
| | | "Email không được để trống" | | | O | | | |
| | | "Email không đúng định dạng" | | | | O | | |
| | | "Mật khẩu phải có ít nhất 6 ký tự" | | | | | O | |
| | | "Mật khẩu không được để trống" | | | | | | O |
| **Result** | **Type** | Normal (N) / Abnormal (A) / Boundary (B) | N | B | B | A | A | A |
| | **Status** | Passed (P) / Failed (F) | P | P | P | P | P | P |
| | **Date** | Ngày chạy thử | 12-May | 12-May | 12-May | 12-May | 12-May | 12-May |
| | **Defect ID** | Mã lỗi phát sinh | - | - | - | - | - | - |

---

## 3. Chức Năng: Tìm Kiếm & Bộ Lọc Sản Phẩm (Product Search & Filter)

| Thuộc tính | Chi tiết | Thông tin |
| :--- | :--- | :--- |
| **Function Code** | PROD_SEARCH | **Function Name** | Tìm kiếm nâng cao & Lọc sản phẩm |
| **Created By** | Tạ Đức Bảo | **Executed By** | Nhóm QC |
| **Lines of code** | 250 | **Lack of test cases** | 0 |

### Bảng tóm tắt kết quả
| Passed | Failed | Untested | N (Normal) | A (Abnormal) | B (Boundary) | Total Test Cases |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 6 | 0 | 0 | 2 | 2 | 2 | 6 |

### Ma trận Test Case
| Phân loại | Điều kiện / Mong muốn | Giá trị đầu vào / đầu ra | UTCID01 | UTCID02 | UTCID03 | UTCID04 | UTCID05 | UTCID06 |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Condition** | **Precondition** | **Từ khóa tìm kiếm (Query)** | | | | | | |
| | | "  chair  " (Có khoảng trắng, chữ thường) | O | | | | | |
| | | "cHaIr" (Chữ hoa thường xen kẽ) | | O | | | | |
| | | null / Trống | | | O | O | O | O |
| | | **Khoảng giá (Min - Max Price)** | | | | | | |
| | | Giá trị hợp lệ (100.0 - 300.0) | | | O | | | |
| | | Giá trị âm / Không hợp lệ | | | | O | | |
| | | **Bộ lọc đặc biệt** | | | | | | |
| | | InStockOnly = true (Còn hàng) | | | | | O | |
| | | OnSaleOnly = true (Đang giảm giá) | | | | | | O |
| **Confirm** | **Return** | **Kết quả tìm kiếm & Lọc** | | | | | | |
| | | Khớp 1 sản phẩm chính xác, tự động Trim | O | O | | | | |
| | | Lọc đúng khoảng giá, trả về 2 sản phẩm | | | O | | | |
| | | Ném lỗi Bad Request (Giá trị âm) | | | | O | | |
| | | Chỉ trả về sản phẩm có StockLeft > 0 | | | | | O | |
| | | Chỉ trả về sản phẩm có OldPrice > Price | | | | | | O |
| **Result** | **Type** | Normal (N) / Abnormal (A) / Boundary (B) | N | N | B | A | B | A |
| | **Status** | Passed (P) / Failed (F) | P | P | P | P | P | P |
| | **Date** | Ngày chạy thử | 15-Jun | 15-Jun | 15-Jun | 15-Jun | 15-Jun | 15-Jun |
| | **Defect ID** | Mã lỗi phát sinh | - | - | - | - | - | - |

---

## 4. Chức Năng: Đánh Giá Sản Phẩm (Product Review)

| Thuộc tính | Chi tiết | Thông tin |
| :--- | :--- | :--- |
| **Function Code** | PROD_REVIEW | **Function Name** | Đánh giá sản phẩm & Tự tính lại điểm trung bình |
| **Created By** | Tạ Đức Bảo | **Executed By** | Nhóm QC |
| **Lines of code** | 100 | **Lack of test cases** | 0 |

### Bảng tóm tắt kết quả
| Passed | Failed | Untested | N (Normal) | A (Abnormal) | B (Boundary) | Total Test Cases |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 5 | 0 | 0 | 1 | 2 | 2 | 5 |

### Ma trận Test Case
| Phân loại | Điều kiện / Mong muốn | Giá trị đầu vào / đầu ra | UTCID01 | UTCID02 | UTCID03 | UTCID04 | UTCID05 |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Condition** | **Precondition** | **Sản phẩm (Product)** | | | | | |
| | | Tồn tại trong hệ thống | O | O | O | O | |
| | | Không tồn tại (Mã sai) | | | | | O |
| | | **Điểm đánh giá (Rating)** | | | | | |
| | | Hợp lệ (1 - 5 sao) | O | | | | O |
| | | Vượt biên trên (> 5 sao, ví dụ: 6) | | O | | | |
| | | Vượt biên dưới (< 1 sao, ví dụ: 0) | | | O | | |
| | | **Người dùng (User)** | | | | | |
| | | Đã đăng nhập hợp lệ | O | O | O | | O |
| | | Chưa đăng nhập | | | | O | |
| **Confirm** | **Return** | **Xử lý hệ thống** | | | | | |
| | | Thêm thành công, cập nhật điểm TB của SP | O | | | | |
| | | Tự động Clamp về tối đa 5 sao và lưu | | O | | | |
| | | Tự động Clamp về tối thiểu 1 sao và lưu | | | O | | |
| | | Ném lỗi Unauthorized (Yêu cầu đăng nhập) | | | | O | |
| | | Ném lỗi Exception ("Product does not exist")| | | | | O |
| **Result** | **Type** | Normal (N) / Abnormal (A) / Boundary (B) | N | B | B | A | A |
| | **Status** | Passed (P) / Failed (F) | P | P | P | P | P |
| | **Date** | Ngày chạy thử | 18-Jun | 18-Jun | 18-Jun | 18-Jun | 18-Jun |
| | **Defect ID** | Mã lỗi phát sinh | - | - | - | - | - |

---

## 5. Chức Năng: Giỏ Hàng (Cart)

| Thuộc tính | Chi tiết | Thông tin |
| :--- | :--- | :--- |
| **Function Code** | COMMERCE_CART | **Function Name** | Quản lý Giỏ hàng (Thêm & Cập nhật số lượng) |
| **Created By** | Tạ Đức Bảo | **Executed By** | Nhóm QC |
| **Lines of code** | 180 | **Lack of test cases** | 0 |

### Bảng tóm tắt kết quả
| Passed | Failed | Untested | N (Normal) | A (Abnormal) | B (Boundary) | Total Test Cases |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 5 | 0 | 0 | 1 | 2 | 2 | 5 |

### Ma trận Test Case
| Phân loại | Điều kiện / Mong muốn | Giá trị đầu vào / đầu ra | UTCID01 | UTCID02 | UTCID03 | UTCID04 | UTCID05 |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Condition** | **Precondition** | **Trạng thái sản phẩm** | | | | | |
| | | Đang mở bán (IsActive = true) | O | O | O | | O |
| | | Ngừng bán (IsActive = false) | | | | O | |
| | | **Số lượng thêm (Quantity)** | | | | | |
| | | Hợp lệ (Nằm trong mức tồn kho của cửa hàng)| O | | | | |
| | | Vượt quá số lượng tồn kho vật lý của SP | | O | | | |
| | | Không hợp lệ (Bằng 0 hoặc âm) | | | O | | |
| | | **Tồn kho thực tế (StockLeft)** | | | | | |
| | | Còn hàng (StockLeft > 0) | O | O | O | O | |
| | | Hết hàng (StockLeft = 0) | | | | | O |
| **Confirm** | **Return** | **Xử lý hệ thống** | | | | | |
| | | Thêm vào giỏ thành công, cập nhật số lượng | O | | | | |
| | | Ném lỗi Conflict ("Stock not available") | | O | | | |
| | | Ném lỗi ValidationError (Số lượng phải > 0)| | | O | | |
| | | Ném lỗi Conflict (Sản phẩm ngừng hoạt động)| | | | O | |
| | | Ném lỗi Conflict (Sản phẩm đã hết hàng) | | | | | O |
| **Result** | **Type** | Normal (N) / Abnormal (A) / Boundary (B) | N | B | A | A | B |
| | **Status** | Passed (P) / Failed (F) | P | P | P | P | P |
| | **Date** | Ngày chạy thử | 19-Jun | 19-Jun | 19-Jun | 19-Jun | 19-Jun |
| | **Defect ID** | Mã lỗi phát sinh | - | - | - | - | - |

---

## 6. Chức Năng: Đặt Hàng (Place Order)

| Thuộc tính | Chi tiết | Thông tin |
| :--- | :--- | :--- |
| **Function Code** | COMMERCE_ORDER | **Function Name** | Đặt hàng & Xử lý trừ kho vật lý |
| **Created By** | Tạ Đức Bảo | **Executed By** | Nhóm QC |
| **Lines of code** | 300 | **Lack of test cases** | 0 |

### Bảng tóm tắt kết quả
| Passed | Failed | Untested | N (Normal) | A (Abnormal) | B (Boundary) | Total Test Cases |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 5 | 0 | 0 | 1 | 3 | 1 | 5 |

### Ma trận Test Case
| Phân loại | Điều kiện / Mong muốn | Giá trị đầu vào / đầu ra | UTCID01 | UTCID02 | UTCID03 | UTCID04 | UTCID05 |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Condition** | **Precondition** | **Trạng thái Giỏ hàng** | | | | | |
| | | Có sản phẩm hợp lệ | O | O | O | | O |
| | | Giỏ hàng rỗng | | | | O | |
| | | **Thông tin Địa chỉ giao hàng** | | | | | |
| | | Nhập địa chỉ cụ thể | O | | | | |
| | | Để trống địa chỉ (Nhưng User đã có địa chỉ mặc định) | | O | | | |
| | | Để trống địa chỉ (User KHÔNG có địa chỉ mặc định) | | | O | | |
| | | **Số lượng tồn kho khi thanh toán** | | | | | |
| | | Đủ số lượng cung cấp | O | O | | O | |
| | | Bị hết hàng giữa chừng (User khác mua trước) | | | | | O |
| **Confirm** | **Return** | **Xử lý hệ thống** | | | | | |
| | | Đặt hàng thành công, trừ kho, làm sạch giỏ| O | | | | |
| | | Tự động lấy địa chỉ mặc định & đặt thành công| | O | | | |
| | | Ném lỗi Validation (Thiếu thông tin địa chỉ)| | | O | | |
| | | Ném lỗi Conflict (Giỏ hàng trống) | | | | O | |
| | | Ném lỗi Conflict (Sản phẩm hết hàng) | | | | | O |
| **Result** | **Type** | Normal (N) / Abnormal (A) / Boundary (B) | N | B | A | A | A |
| | **Status** | Passed (P) / Failed (F) | P | P | P | P | P |
| | **Date** | Ngày chạy thử | 20-Jun | 20-Jun | 20-Jun | 20-Jun | 20-Jun |
| | **Defect ID** | Mã lỗi phát sinh | - | - | - | - | - |

---

## 7. Chức Năng: Hủy & Hoàn Tiền Đơn Hàng (Order Cancel & Refund)

| Thuộc tính | Chi tiết | Thông tin |
| :--- | :--- | :--- |
| **Function Code** | ORDER_REFUND | **Function Name** | Hủy đơn hàng / Yêu cầu hoàn tiền |
| **Created By** | Tạ Đức Bảo | **Executed By** | Nhóm QC |
| **Lines of code** | 200 | **Lack of test cases** | 0 |

### Bảng tóm tắt kết quả
| Passed | Failed | Untested | N (Normal) | A (Abnormal) | B (Boundary) | Total Test Cases |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 6 | 0 | 0 | 2 | 2 | 2 | 6 |

### Ma trận Test Case
| Phân loại | Điều kiện / Mong muốn | Giá trị đầu vào / đầu ra | UTCID01 | UTCID02 | UTCID03 | UTCID04 | UTCID05 | UTCID06 |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Condition** | **Precondition** | **Trạng thái Đơn hàng** | | | | | | |
| | | Pending / Chờ thanh toán | O | | | | | |
| | | Paid / Đã thanh toán | | O | O | | | |
| | | Completed / Hoàn thành | | | | O | | |
| | | Shipping / Đang giao | | | | | O | O |
| | | **Giao dịch VNPay liên quan** | | | | | | |
| | | Không có hoặc Đã hoàn tất | O | | O | O | O | |
| | | Trạng thái giao dịch chờ xử lý (Pending) | | O | | | | O |
| | | **Hành động (Action)** | | | | | | |
| | | Khách hàng bấm Hủy đơn (`Cancel`) | O | O | | | | |
| | | Khách hàng yêu cầu hoàn tiền (`Refund`) | | | O | | | |
| | | Admin duyệt hoàn tiền (`Approve`) | | | | O | | |
| **Confirm** | **Return** | **Xử lý hệ thống** | | | | | | |
| | | Hủy thành công, cộng trả lại kho vật lý | O | | | | | |
| | | Chặn hủy (Ném lỗi giao dịch VNPay đang xử lý)| | O | | | | |
| | | Chấp nhận yêu cầu hoàn tiền của Khách hàng | | | O | | | |
| | | Hoàn tiền về ví KH, chuyển đơn sang Refunded | | | | O | | |
| | | Chặn yêu cầu hoàn tiền (Đơn đang giao) | | | | | O | |
| | | Chặn hủy đơn (Đơn đang giao hàng) | | | | | | O |
| **Result** | **Type** | Normal (N) / Abnormal (A) / Boundary (B) | N | B | N | B | A | A |
| | **Status** | Passed (P) / Failed (F) | P | P | P | P | P | P |
| | **Date** | Ngày chạy thử | 20-Jun | 20-Jun | 20-Jun | 20-Jun | 20-Jun | 20-Jun |
| | **Defect ID** | Mã lỗi phát sinh | - | - | - | - | - | - |

---

## 8. Chức Năng: Tích Hợp Cổng Thanh Toán (Payment - VNPay Callback)

| Thuộc tính | Chi tiết | Thông tin |
| :--- | :--- | :--- |
| **Function Code** | VNPAY_CALLBACK | **Function Name** | Xử lý phản hồi thanh toán từ VNPay |
| **Created By** | Tạ Đức Bảo | **Executed By** | Nhóm QC |
| **Lines of code** | 150 | **Lack of test cases** | 0 |

### Bảng tóm tắt kết quả
| Passed | Failed | Untested | N (Normal) | A (Abnormal) | B (Boundary) | Total Test Cases |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 5 | 0 | 0 | 1 | 2 | 2 | 5 |

### Ma trận Test Case
| Phân loại | Điều kiện / Mong muốn | Giá trị đầu vào / đầu ra | UTCID01 | UTCID02 | UTCID03 | UTCID04 | UTCID05 |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Condition** | **Precondition** | **Mã phản hồi từ VNPay (vnp_ResponseCode)**| | | | | |
| | | "00" (Giao dịch thành công) | O | | O | O | |
| | | "24" / Khác "00" (Giao dịch lỗi/Hủy bởi KH)| | O | | | |
| | | **Số tiền đối soát (vnp_Amount)** | | | | | |
| | | Khớp chính xác với số tiền đơn hàng gốc | O | O | | | O |
| | | Sai lệch số tiền (Ví dụ: Khác số tiền đơn) | | | O | | |
| | | **Trạng thái xác nhận giao dịch** | | | | | |
| | | Chưa được xác nhận trước đó | O | O | O | | O |
| | | Đã được xử lý/xác nhận trước đó (Trùng lặp)| | | | O | |
| **Confirm** | **Return** | **Xử lý hệ thống** | | | | | |
| | | Trả về thành công, cập nhật đơn hàng thành Paid| O | | | | |
| | | Cập nhật thanh toán thất bại, hủy đơn hàng | | O | | | |
| | | Trả về lỗi: Số tiền không khớp (Mã lỗi 04) | | | O | | |
| | | Trả về lỗi: Đơn hàng đã được xác nhận (Mã 02)| | | | O | |
| | | Ném lỗi không tìm thấy đơn hàng tương ứng | | | | | O |
| **Result** | **Type** | Normal (N) / Abnormal (A) / Boundary (B) | N | B | B | A | A |
| | **Status** | Passed (P) / Failed (F) | P | P | P | P | P |
| | **Date** | Ngày chạy thử | 21-Jun | 21-Jun | 21-Jun | 21-Jun | 21-Jun |
| | **Defect ID** | Mã lỗi phát sinh | - | - | - | - | - |

---

## 9. Chức Năng: Ví Điện Tử (E-Wallet Transactions)

| Thuộc tính | Chi tiết | Thông tin |
| :--- | :--- | :--- |
| **Function Code** | WALLET_TRANSACTION | **Function Name** | Nạp, Rút tiền & Thanh toán bằng Ví |
| **Created By** | Tạ Đức Bảo | **Executed By** | Nhóm QC |
| **Lines of code** | 160 | **Lack of test cases** | 0 |

### Bảng tóm tắt kết quả
| Passed | Failed | Untested | N (Normal) | A (Abnormal) | B (Boundary) | Total Test Cases |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 5 | 0 | 0 | 2 | 2 | 1 | 5 |

### Ma trận Test Case
| Phân loại | Điều kiện / Mong muốn | Giá trị đầu vào / đầu ra | UTCID01 | UTCID02 | UTCID03 | UTCID04 | UTCID05 |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Condition** | **Precondition** | **Hành động giao dịch** | | | | | |
| | | Nạp tiền (`Deposit`) | O | | | | |
| | | Rút tiền (`Withdraw`) | | O | O | | |
| | | Thanh toán đơn hàng (`PayOrder`) | | | | O | O |
| | | **Số tiền giao dịch (Amount)** | | | | | |
| | | Lớn hơn 0 (Hợp lệ) | O | O | O | O | |
| | | Bằng 0 hoặc Âm (Không hợp lệ) | | | | | O |
| | | **Số dư ví hiện có (Balance)** | | | | | |
| | | Đủ số tiền giao dịch (Balance >= Amount) | | O | | O | |
| | | Không đủ số tiền (Balance < Amount) | | | O | | |
| **Confirm** | **Return** | **Xử lý hệ thống** | | | | | |
| | | Cộng tiền vào ví, tạo lịch sử giao dịch | O | | | | |
| | | Rút tiền thành công, trừ số dư ví | | O | | | |
| | | Ném lỗi Conflict ("Insufficient balance") | | | O | | |
| | | Trừ ví KH, cộng ví doanh thu Admin | | | | O | |
| | | Ném lỗi Validation (Số tiền phải lớn hơn 0)| | | | | O |
| **Result** | **Type** | Normal (N) / Abnormal (A) / Boundary (B) | N | N | B | A | A |
| | **Status** | Passed (P) / Failed (F) | P | P | P | P | P |
| | **Date** | Ngày chạy thử | 21-Jun | 21-Jun | 21-Jun | 21-Jun | 21-Jun |
| | **Defect ID** | Mã lỗi phát sinh | - | - | - | - | - |

---

## 10. Chức Năng: Áp Dụng Mã Giảm Giá (Coupon Validation)

| Thuộc tính | Chi tiết | Thông tin |
| :--- | :--- | :--- |
| **Function Code** | MKT_COUPON | **Function Name** | Kiểm tra và áp dụng mã giảm giá |
| **Created By** | Tạ Đức Bảo | **Executed By** | Nhóm QC |
| **Lines of code** | 90 | **Lack of test cases** | 0 |

### Bảng tóm tắt kết quả
| Passed | Failed | Untested | N (Normal) | A (Abnormal) | B (Boundary) | Total Test Cases |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 5 | 0 | 0 | 1 | 2 | 2 | 5 |

### Ma trận Test Case
| Phân loại | Điều kiện / Mong muốn | Giá trị đầu vào / đầu ra | UTCID01 | UTCID02 | UTCID03 | UTCID04 | UTCID05 |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Condition** | **Precondition** | **Sự tồn tại của mã Coupon** | | | | | |
| | | Mã đúng, có kích hoạt trong hệ thống | O | O | O | O | |
| | | Mã sai / Không tồn tại | | | | | O |
| | | **Hạn sử dụng (Expiry Date)** | | | | | |
| | | Còn hạn sử dụng (ExpiryDate >= Today) | O | O | | | |
| | | Đã hết hạn sử dụng (ExpiryDate < Today) | | | O | | |
| | | **Số lần đã sử dụng (Usage Count)** | | | | | |
| | | Chưa đạt giới hạn tối đa (Usage < MaxUsage) | O | | | O | |
| | | Đã đạt giới hạn tối đa (Usage >= MaxUsage)| | O | | | |
| **Confirm** | **Return** | **Xử lý hệ thống** | | | | | |
| | | Trả về thông tin giảm giá thành công | O | | | | |
| | | Trả về null (Mã đã dùng hết lượt tối đa) | | O | | | |
| | | Trả về null (Mã giảm giá đã hết hạn) | | | O | | |
| | | Trả về thông tin áp dụng ở mức lượt dùng cuối| | | | O | |
| | | Trả về null (Mã không tồn tại) | | | | | O |
| **Result** | **Type** | Normal (N) / Abnormal (A) / Boundary (B) | N | B | B | A | A |
| | **Status** | Passed (P) / Failed (F) | P | P | P | P | P |
| | **Date** | Ngày chạy thử | 21-Jun | 21-Jun | 21-Jun | 21-Jun | 21-Jun |
| | **Defect ID** | Mã lỗi phát sinh | - | - | - | - | - |

---

## 11. Chức Năng: Thêm Sản Phẩm Mới (Create Product - Admin)

| Thuộc tính | Chi tiết | Thông tin |
| :--- | :--- | :--- |
| **Function Code** | PROD_CREATE | **Function Name** | Chức năng thêm sản phẩm mới của Admin |
| **Created By** | Tạ Đức Bảo | **Executed By** | Nhóm QC |
| **Lines of code** | 100 | **Lack of test cases** | 0 |

### Bảng tóm tắt kết quả
| Passed | Failed | Untested | N (Normal) | A (Abnormal) | B (Boundary) | Total Test Cases |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 5 | 0 | 0 | 1 | 3 | 1 | 5 |

### Ma trận Test Case
| Phân loại | Điều kiện / Mong muốn | Giá trị đầu vào / đầu ra | UTCID01 | UTCID02 | UTCID03 | UTCID04 | UTCID05 |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Condition** | **Precondition** | **Mã SKU của sản phẩm** | | | | | |
| | | SKU mới, chưa tồn tại trong hệ thống | O | | O | O | O |
| | | SKU đã tồn tại trên sản phẩm khác | | O | | | |
| | | **Đường dẫn Slug thân thiện** | | | | | |
| | | Slug mới, chưa tồn tại trong hệ thống | O | O | | O | O |
| | | Slug đã tồn tại trên sản phẩm khác | | | O | | |
| | | **So sánh giá (Price vs OriginalPrice)** | | | | | |
| | | OriginalPrice >= Price (Hợp lệ) | O | O | O | | O |
| | | OriginalPrice < Price (Sai logic giảm giá)| | | | O | |
| | | **Danh mục gán (Category)** | | | | | |
| | | Danh mục đang hoạt động (IsActive = true)| O | O | O | O | |
| | | Danh mục đang bị khóa (IsActive = false) | | | | | O |
| **Confirm** | **Return** | **Xử lý hệ thống** | | | | | |
| | | Thêm thành công, trả về ProductView | O | | | | |
| | | Ném lỗi Conflict ("Product SKU is already in use")| | O | | | |
| | | Ném lỗi Conflict ("Product slug is already in use")| | | O | | |
| | | Ném lỗi ValidationError (OriginalPrice không hợp lệ)| | | | O | |
| | | Ném lỗi Conflict (Danh mục không hoạt động)| | | | | O |
| **Result** | **Type** | Normal (N) / Abnormal (A) / Boundary (B) | N | B | B | A | A |
| | **Status** | Passed (P) / Failed (F) | P | P | P | P | P |
| | **Date** | Ngày chạy thử | 21-Jun | 21-Jun | 21-Jun | 21-Jun | 21-Jun |
| | **Defect ID** | Mã lỗi phát sinh | - | - | - | - | - |

---

## 12. Chức Năng: Chỉnh Sửa Sản Phẩm (Update Product - Admin)

| Thuộc tính | Chi tiết | Thông tin |
| :--- | :--- | :--- |
| **Function Code** | PROD_UPDATE | **Function Name** | Chức năng sửa thông tin sản phẩm |
| **Created By** | Tạ Đức Bảo | **Executed By** | Nhóm QC |
| **Lines of code** | 120 | **Lack of test cases** | 0 |

### Bảng tóm tắt kết quả
| Passed | Failed | Untested | N (Normal) | A (Abnormal) | B (Boundary) | Total Test Cases |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 4 | 0 | 0 | 1 | 2 | 1 | 4 |

### Ma trận Test Case
| Phân loại | Điều kiện / Mong muốn | Giá trị đầu vào / đầu ra | UTCID01 | UTCID02 | UTCID03 | UTCID04 |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **Condition** | **Precondition** | **Sự tồn tại của sản phẩm cần sửa**| | | | |
| | | Sản phẩm tồn tại trong hệ thống | O | O | O | |
| | | Sản phẩm không tồn tại (Sai ID) | | | | O |
| | | **Mã SKU sửa đổi** | | | | |
| | | Sku mới (Chưa ai dùng) hoặc giữ nguyên SKU cũ| O | | O | |
| | | Sku trùng với một sản phẩm khác trong DB | | O | | |
| | | **So sánh giá sửa đổi** | | | | |
| | | OriginalPrice >= Price (Hợp lệ) | O | O | | |
| | | OriginalPrice < Price (Sai logic) | | | O | |
| **Confirm** | **Return** | **Xử lý hệ thống** | | | | |
| | | Cập nhật thành công, trả về ProductView | O | | | |
| | | Ném lỗi Conflict (Mã SKU đã được sản phẩm khác dùng)| | O | | |
| | | Ném lỗi ValidationError (OriginalPrice không hợp lệ)| | | O | |
| | | Trả về null (Không tìm thấy sản phẩm cần sửa) | | | | O |
| **Result** | **Type** | Normal (N) / Abnormal (A) / Boundary (B) | N | B | A | A |
| | **Status** | Passed (P) / Failed (F) | P | P | P | P |
| | **Date** | Ngày chạy thử | 21-Jun | 21-Jun | 21-Jun | 21-Jun |
| | **Defect ID** | Mã lỗi phát sinh | - | - | - | - |

---

## 13. Chức Năng: Xóa Sản Phẩm (Delete Product - Admin)

| Thuộc tính | Chi tiết | Thông tin |
| :--- | :--- | :--- |
| **Function Code** | PROD_DELETE | **Function Name** | Chức năng xóa sản phẩm của Admin |
| **Created By** | Tạ Đức Bảo | **Executed By** | Nhóm QC |
| **Lines of code** | 30 | **Lack of test cases** | 0 |

### Bảng tóm tắt kết quả
| Passed | Failed | Untested | N (Normal) | A (Abnormal) | B (Boundary) | Total Test Cases |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 2 | 0 | 0 | 1 | 1 | 0 | 2 |

### Ma trận Test Case
| Phân loại | Điều kiện / Mong muốn | Giá trị đầu vào / đầu ra | UTCID01 | UTCID02 |
| :--- | :--- | :--- | :---: | :---: |
| **Condition** | **Precondition** | **Mã sản phẩm (ProductID)** | | |
| | | Sản phẩm tồn tại trong cơ sở dữ liệu | O | |
| | | Sản phẩm không tồn tại (ID không hợp lệ)| | O |
| **Confirm** | **Return** | **Kết quả thực thi** | | |
| | | Trả về true (Xóa thành công khỏi DB) | O | |
| | | Trả về false (Không tìm thấy sản phẩm) | | O |
| **Result** | **Type** | Normal (N) / Abnormal (A) / Boundary (B) | N | A |
| | **Status** | Passed (P) / Failed (F) | P | P |
| | **Date** | Ngày chạy thử | 21-Jun | 21-Jun |
| | **Defect ID** | Mã lỗi phát sinh | - | - |

---

## 14. Chức Năng: Quản Lý Sổ Địa Chỉ (Address Management - User)

| Thuộc tính | Chi tiết | Thông tin |
| :--- | :--- | :--- |
| **Function Code** | USER_ADDRESS | **Function Name** | Quản lý sổ địa chỉ của khách hàng |
| **Created By** | Tạ Đức Bảo | **Executed By** | Nhóm QC |
| **Lines of code** | 60 | **Lack of test cases** | 0 |

### Bảng tóm tắt kết quả
| Passed | Failed | Untested | N (Normal) | A (Abnormal) | B (Boundary) | Total Test Cases |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 5 | 0 | 0 | 2 | 2 | 1 | 5 |

### Ma trận Test Case
| Phân loại | Điều kiện / Mong muốn | Giá trị đầu vào / đầu ra | UTCID01 | UTCID02 | UTCID03 | UTCID04 | UTCID05 |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Condition** | **Precondition** | **Hành động (Action)** | | | | | |
| | | Thêm địa chỉ mới (`Add`) | O | | | | |
| | | Cập nhật địa chỉ (`Update`) | | O | O | | |
| | | Xóa địa chỉ (`Delete`) | | | | O | O |
| | | **Địa chỉ mặc định (IsDefault)** | | | | | |
| | | Thiết lập làm mặc định (IsDefault = true) | O | | O | | |
| | | Không đặt làm mặc định (IsDefault = false)| | O | | | |
| | | **Sự tồn tại của Địa chỉ ID** | | | | | |
| | | Địa chỉ ID tồn tại trong DB | | O | O | O | |
| | | Địa chỉ ID không tồn tại trong DB | | | | | O |
| **Confirm** | **Return** | **Xử lý hệ thống** | | | | | |
| | | Thêm thành công, tự động đặt các địa chỉ khác thành không mặc định | O | | | | |
| | | Cập nhật thông tin thành công | | O | | | |
| | | Cập nhật thành công, chuyển các địa chỉ cũ thành không mặc định | | | O | | |
| | | Xóa thành công, trả về true | | | | O | |
| | | Trả về false / null (Không tìm thấy địa chỉ) | | | | | O |
| **Result** | **Type** | Normal (N) / Abnormal (A) / Boundary (B) | N | N | B | A | A |
| | **Status** | Passed (P) / Failed (F) | P | P | P | P | P |
| | **Date** | Ngày chạy thử | 21-Jun | 21-Jun | 21-Jun | 21-Jun | 21-Jun |
| | **Defect ID** | Mã lỗi phát sinh | - | - | - | - | - |

---

## 15. Chức Năng: Quản Lý Danh Mục (Category CRUD - Admin)

| Thuộc tính | Chi tiết | Thông tin |
| :--- | :--- | :--- |
| **Function Code** | CAT_CRUD | **Function Name** | Quản lý danh mục sản phẩm |
| **Created By** | Tạ Đức Bảo | **Executed By** | Nhóm QC |
| **Lines of code** | 80 | **Lack of test cases** | 0 |

### Bảng tóm tắt kết quả
| Passed | Failed | Untested | N (Normal) | A (Abnormal) | B (Boundary) | Total Test Cases |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 5 | 0 | 0 | 1 | 2 | 2 | 5 |

### Ma trận Test Case
| Phân loại | Điều kiện / Mong muốn | Giá trị đầu vào / đầu ra | UTCID01 | UTCID02 | UTCID03 | UTCID04 | UTCID05 |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Condition** | **Precondition** | **Tên / Slug danh mục** | | | | | |
| | | Duy nhất, chưa tồn tại trong hệ thống | O | | O | O | O |
| | | Trùng lặp với danh mục khác đã có | | O | | | |
| | | **Liên kết sản phẩm hoạt động** | | | | | |
| | | Không chứa sản phẩm nào đang hoạt động | O | O | O | | |
| | | Còn sản phẩm đang mở bán bên trong | | | | O | O |
| | | **Hành động đặc biệt** | | | | | |
| | | Tắt kích hoạt danh mục (Deactivate) | | | O | O | |
| | | Xóa danh mục khỏi hệ thống (Delete) | | | | | O |
| **Confirm** | **Return** | **Xử lý hệ thống** | | | | | |
| | | Tạo mới thành công, trả về CategoryView | O | | | | |
| | | Ném lỗi Conflict (Trùng tên/slug danh mục) | | O | | | |
| | | Cập nhật thay đổi trạng thái kích hoạt thành công | | | O | | |
| | | Chặn tắt kích hoạt (Ném lỗi khi vẫn còn sản phẩm đang bán) | | | | O | |
| | | Chặn xóa danh mục (Ném lỗi danh mục còn sản phẩm) | | | | | O |
| **Result** | **Type** | Normal (N) / Abnormal (A) / Boundary (B) | N | B | B | A | A |
| | **Status** | Passed (P) / Failed (F) | P | P | P | P | P |
| | **Date** | Ngày chạy thử | 21-Jun | 21-Jun | 21-Jun | 21-Jun | 21-Jun |
| | **Defect ID** | Mã lỗi phát sinh | - | - | - | - | - |

---

## 16. Chức Năng: Tạo URL Thanh Toán (Payment - Create VNPay URL)

| Thuộc tính | Chi tiết | Thông tin |
| :--- | :--- | :--- |
| **Function Code** | PAYMENT_CREATE_URL | **Function Name** | Tạo liên kết thanh toán VNPay |
| **Created By** | Tạ Đức Bảo | **Executed By** | Nhóm QC |
| **Lines of code** | 80 | **Lack of test cases** | 0 |

### Bảng tóm tắt kết quả
| Passed | Failed | Untested | N (Normal) | A (Abnormal) | B (Boundary) | Total Test Cases |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 3 | 0 | 0 | 1 | 2 | 0 | 3 |

### Ma trận Test Case
| Phân loại | Điều kiện / Mong muốn | Giá trị đầu vào / đầu ra | UTCID01 | UTCID02 | UTCID03 |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Condition** | **Precondition** | **Đơn hàng kiểm tra (OrderID)** | | | |
| | | Đơn hàng tồn tại, chưa thanh toán (Pending) | O | | |
| | | Đơn hàng không tồn tại trong hệ thống | | O | |
| | | Đơn hàng đã thanh toán trước đó (Paid) | | | O |
| **Confirm** | **Return** | **Xử lý hệ thống** | | | |
| | | Trả về chuỗi URL thanh toán VNPay hợp lệ | O | | |
| | | Ném lỗi NotFoundException (Không tìm thấy đơn) | | O | |
| | | Ném lỗi ConflictException (Đơn hàng đã thanh toán) | | | O |
| **Result** | **Type** | Normal (N) / Abnormal (A) / Boundary (B) | N | A | A |
| | **Status** | Passed (P) / Failed (F) | P | P | P |
| | **Date** | Ngày chạy thử | 21-Jun | 21-Jun | 21-Jun |
| | **Defect ID** | Mã lỗi phát sinh | - | - | - |

---

## 17. Chức Năng: Cập Nhật Trạng Thái Đơn Hàng (Admin Order Status Update)

| Thuộc tính | Chi tiết | Thông tin |
| :--- | :--- | :--- |
| **Function Code** | ORDER_UPDATE_STATUS | **Function Name** | Cập nhật trạng thái đơn hàng của Admin |
| **Created By** | Tạ Đức Bảo | **Executed By** | Nhóm QC |
| **Lines of code** | 100 | **Lack of test cases** | 0 |

### Bảng tóm tắt kết quả
| Passed | Failed | Untested | N (Normal) | A (Abnormal) | B (Boundary) | Total Test Cases |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 4 | 0 | 0 | 2 | 1 | 1 | 4 |

### Ma trận Test Case
| Phân loại | Điều kiện / Mong muốn | Giá trị đầu vào / đầu ra | UTCID01 | UTCID02 | UTCID03 | UTCID04 |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **Condition** | **Precondition** | **Trạng thái hiện tại của đơn hàng** | | | | |
| | | Processing (Đang chuẩn bị hàng) | O | | | |
| | | Shipping (Đang giao hàng) | | O | | |
| | | Pending (Chưa thanh toán) | | | O | O |
| | | **Trạng thái đích muốn cập nhật** | | | | |
| | | Shipping (Giao hàng) | O | | | |
| | | Completed (Hoàn thành) | | O | | |
| | | Completed (Nhảy vọt trạng thái) | | | O | |
| | | Cancelled (Hủy đơn hàng) | | | | O |
| **Confirm** | **Return** | **Xử lý hệ thống** | | | | |
| | | Cập nhật thành công sang Shipping | O | | | |
| | | Cập nhật thành công sang Completed | | O | | |
| | | Chặn cập nhật (Đơn chưa thanh toán không thể hoàn thành) | | | O | |
| | | Cho phép hủy đơn hàng chưa thanh toán | | | | O |
| **Result** | **Type** | Normal (N) / Abnormal (A) / Boundary (B) | N | N | A | B |
| | **Status** | Passed (P) / Failed (F) | P | P | P | P |
| | **Date** | Ngày chạy thử | 21-Jun | 21-Jun | 21-Jun | 21-Jun |
| | **Defect ID** | Mã lỗi phát sinh | - | - | - | - |

---

## 18. Chức Năng: Quản Lý Tin Tức / Bài Viết Blog (Blog CRUD - Admin)

| Thuộc tính | Chi tiết | Thông tin |
| :--- | :--- | :--- |
| **Function Code** | MKT_BLOG_CRUD | **Function Name** | Quản lý tin tức bài viết của Admin |
| **Created By** | Tạ Đức Bảo | **Executed By** | Nhóm QC |
| **Lines of code** | 80 | **Lack of test cases** | 0 |

### Bảng tóm tắt kết quả
| Passed | Failed | Untested | N (Normal) | A (Abnormal) | B (Boundary) | Total Test Cases |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 4 | 0 | 0 | 1 | 2 | 1 | 4 |

### Ma trận Test Case
| Phân loại | Điều kiện / Mong muốn | Giá trị đầu vào / đầu ra | UTCID01 | UTCID02 | UTCID03 | UTCID04 |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **Condition** | **Precondition** | **Tiêu đề bài viết (Title)** | | | | |
| | | Hợp lệ (Không trống) | O | | O | O |
| | | Trống / Rỗng | | O | | |
| | | **Ảnh bìa bài viết (ImageUrl)** | | | | |
| | | Đã được upload đường dẫn hợp lệ | O | O | | O |
| | | Trống / Rỗng | | | O | |
| | | **Hành động (Action)** | | | | |
| | | Tạo bài viết mới | O | O | O | |
| | | Xóa bài viết (Mã bài viết không tồn tại) | | | | O |
| **Confirm** | **Return** | **Xử lý hệ thống** | | | | |
| | | Đăng bài viết thành công | O | | | |
| | | Ném lỗi Validation (Tiêu đề không được để trống) | | O | | |
| | | Ném lỗi Validation (Chưa tải ảnh bìa lên) | | | O | |
| | | Trả về false khi xóa bài không tồn tại | | | | O |
| **Result** | **Type** | Normal (N) / Abnormal (A) / Boundary (B) | N | B | A | A |
| | **Status** | Passed (P) / Failed (F) | P | P | P | P |
| | **Date** | Ngày chạy thử | 21-Jun | 21-Jun | 21-Jun | 21-Jun |
| | **Defect ID** | Mã lỗi phát sinh | - | - | - | - |

---

## 19. Chức Năng: Tiếp Nhận Ý Kiến Phản Hồi (Feedback Collection)

| Thuộc tính | Chi tiết | Thông tin |
| :--- | :--- | :--- |
| **Function Code** | SETTING_FEEDBACK | **Function Name** | Tiếp nhận ý kiến phản hồi từ khách hàng |
| **Created By** | Tạ Đức Bảo | **Executed By** | Nhóm QC |
| **Lines of code** | 50 | **Lack of test cases** | 0 |

### Bảng tóm tắt kết quả
| Passed | Failed | Untested | N (Normal) | A (Abnormal) | B (Boundary) | Total Test Cases |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 3 | 0 | 0 | 1 | 2 | 0 | 3 |

### Ma trận Test Case
| Phân loại | Điều kiện / Mong muốn | Giá trị đầu vào / đầu ra | UTCID01 | UTCID02 | UTCID03 |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Condition** | **Precondition** | **Họ và tên khách hàng** | | | |
| | | Nhập đầy đủ | O | | O |
| | | Để trống / Rỗng | | O | |
| | | **Nội dung phản hồi (Feedback)** | | | |
| | | Nhập đầy đủ | O | O | |
| | | Để trống / Rỗng | | | O |
| **Confirm** | **Return** | **Xử lý hệ thống** | | | |
| | | Gửi phản hồi thành công, lưu vào DB | O | | |
| | | Ném lỗi ValidationError (Tên không được trống) | | O | |
| | | Ném lỗi ValidationError (Nội dung không được trống) | | | O |
| **Result** | **Type** | Normal (N) / Abnormal (A) / Boundary (B) | N | A | A |
| | **Status** | Passed (P) / Failed (F) | P | P | P |
| | **Date** | Ngày chạy thử | 21-Jun | 21-Jun | 21-Jun |
| | **Defect ID** | Mã lỗi phát sinh | - | - | - |

---

## 20. Chức Năng: Thống Kê Hệ Thống (Dashboard Stats - Admin)

| Thuộc tính | Chi tiết | Thông tin |
| :--- | :--- | :--- |
| **Function Code** | ADMIN_DASHBOARD_STATS | **Function Name** | Xem số liệu báo cáo doanh thu & tăng trưởng |
| **Created By** | Tạ Đức Bảo | **Executed By** | Nhóm QC |
| **Lines of code** | 90 | **Lack of test cases** | 0 |

### Bảng tóm tắt kết quả
| Passed | Failed | Untested | N (Normal) | A (Abnormal) | B (Boundary) | Total Test Cases |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 3 | 0 | 0 | 1 | 1 | 1 | 3 |

### Ma trận Test Case
| Phân loại | Điều kiện / Mong muốn | Giá trị đầu vào / đầu ra | UTCID01 | UTCID02 | UTCID03 |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Condition** | **Precondition** | **Quyền hạn tài khoản gọi API** | | | |
| | | Quản trị viên (Role = Admin) | O | O | |
| | | Khách hàng thường (Role = Customer) | | | O |
| | | **Doanh thu tuần trước** | | | |
| | | Lớn hơn 0 (Ví dụ: 10,000,000) | O | | |
| | | Bằng 0 (Doanh thu tuần trước trống) | | O | |
| **Confirm** | **Return** | **Xử lý hệ thống** | | | |
| | | Trả về danh sách số liệu và tính % tăng trưởng bình thường | O | | |
| | | Trả về tăng trưởng 100% (Tránh lỗi chia cho 0) | | O | |
| | | Ném lỗi ForbiddenException (Quyền truy cập bị từ chối) | | | O |
| **Result** | **Type** | Normal (N) / Abnormal (A) / Boundary (B) | N | B | A |
| | **Status** | Passed (P) / Failed (F) | P | P | P |
| | **Date** | Ngày chạy thử | 21-Jun | 21-Jun | 21-Jun |
| | **Defect ID** | Mã lỗi phát sinh | - | - | - |

---

## 21. Chức Năng: Quản Lý Thiết Lập Cấu Hình (System Settings - Admin)

| Thuộc tính | Chi tiết | Thông tin |
| :--- | :--- | :--- |
| **Function Code** | SYSTEM_SETTINGS | **Function Name** | Quản lý thông số cấu hình hệ thống |
| **Created By** | Tạ Đức Bảo | **Executed By** | Nhóm QC |
| **Lines of code** | 70 | **Lack of test cases** | 0 |

### Bảng tóm tắt kết quả
| Passed | Failed | Untested | N (Normal) | A (Abnormal) | B (Boundary) | Total Test Cases |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 3 | 0 | 0 | 2 | 0 | 1 | 3 |

### Ma trận Test Case
| Phân loại | Điều kiện / Mong muốn | Giá trị đầu vào / đầu ra | UTCID01 | UTCID02 | UTCID03 |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Condition** | **Precondition** | **Cơ sở dữ liệu cấu hình hệ thống** | | | |
| | | Đã có bản ghi thiết lập cấu hình | O | | O |
| | | Trống / Chưa được thiết lập lần nào | | O | |
| | | **Hành động (Action)** | | | |
| | | Truy vấn cấu hình (`GetSettings`) | O | O | |
| | | Cập nhật cấu hình mới (`UpdateSettings`) | | | O |
| **Confirm** | **Return** | **Xử lý hệ thống** | | | |
| | | Trả về thông số cấu hình đang lưu trong DB | O | | |
| | | Tự động sinh cấu hình mặc định và trả về | | O | | |
| | | Ghi đè cấu hình mới, cập nhật thời gian UpdatedAt | | | O |
| **Result** | **Type** | Normal (N) / Abnormal (A) / Boundary (B) | N | B | N |
| | **Status** | Passed (P) / Failed (F) | P | P | P |
| | **Date** | Ngày chạy thử | 21-Jun | 21-Jun | 21-Jun |
| | **Defect ID** | Mã lỗi phát sinh | - | - | - |
