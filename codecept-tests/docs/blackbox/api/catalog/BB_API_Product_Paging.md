# Black-box API Test - Product Paging

## 1. Thông tin chung

| Nội dung | Giá trị |
| --- | --- |
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/catalog_api_test.js` |
| Function/API được test | `Product.Paging` |
| Method/Endpoint | `GET /api/products?page={page}&pageSize={pageSize}` |
| Công cụ | CodeceptJS REST helper |
| Lệnh chạy | `npm run test:be:catalog` |
| Kết quả chạy thực tế | `Đã chạy catalog_api_test.js và các scenario pass` |

## 2. Mục tiêu kiểm thử

Tài liệu này mô tả cách kiểm thử API từ bên ngoài thông qua HTTP request và HTTP response.

Với nhóm Catalog, input thường là query string, route parameter, token đăng nhập hoặc request body.  
Output cần kiểm tra là status code, danh sách dữ liệu, chi tiết dữ liệu hoặc thông báo lỗi tương ứng.

---

# NỘI DUNG THIẾT KẾ KIỂM THỬ API

---

## 1. Xác định lớp tương đương

| Biến đầu vào | Lớp hợp lệ | Tag | Lớp không hợp lệ | Tag |
| --- | --- | --- | --- | --- |
| page | page 1 hợp lệ | V1 | page <= 0 | X1 |
| page | page 2 hợp lệ | V2 | page sai định dạng | X2 |
| pageSize | pageSize hợp lệ | V3 | pageSize <= 0 | X3 |
| Dữ liệu phân trang | Page 1 và page 2 không trùng dữ liệu | V4 | Hai page bị trùng dữ liệu | X4 |

### Output cần kiểm tra

API trả về đúng số lượng sản phẩm theo pageSize, page 1 và page 2 không bị trùng sản phẩm.

---

## 2. Phân tích giá trị biên / biên dữ liệu API

Với API Catalog, không phải input nào cũng có miền số rõ ràng.  
Do đó, phần này kết hợp kiểm tra giá trị biên số và biên dữ liệu nghiệp vụ như rỗng, sai định dạng hoặc không tồn tại.

| Biến đầu vào | Giá trị hợp lệ đại diện | Giá trị biên / giá trị lỗi | Expected Output | Tag biên |
| --- | --- | --- | --- | --- |
| page | `1` | `0` | `400` hoặc xử lý an toàn | B1 |
| pageSize | `5` | `0` | `400` hoặc xử lý an toàn | B2 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Phân trang sản phẩm đúng pageSize | `GET /api/products?page=1&pageSize=5` và `GET /api/products?page=2&pageSize=5` | `2xx`, mỗi page không vượt pageSize và không trùng productId | API phân trang đúng, page 1 và page 2 không trùng sản phẩm | Pass | V1, V2, V3, V4 |
| 2 | pageSize không hợp lệ | `GET /api/products?page=1&pageSize=0` | `400` hoặc xử lý an toàn | Chưa có trong file test hiện tại | Chưa kiểm thử | X3 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/catalog_api_test.js`:

```javascript
Scenario("Product Paging: phân trang sản phẩm đúng pageSize", async ({ I }) => {
  const pageSize = 5;

  const page1 = await getProductList(I, "?page=1&pageSize=" + pageSize);
  const page2 = await getProductList(I, "?page=2&pageSize=" + pageSize);

  assert(page1.products.length <= pageSize, "Page 1 trả về nhiều hơn pageSize");
  assert(page2.products.length <= pageSize, "Page 2 trả về nhiều hơn pageSize");

  const idsPage1 = page1.products.map(getProductId);
  const idsPage2 = page2.products.map(getProductId);

  const duplicatedIds = idsPage1.filter((id) => idsPage2.includes(id));

  assert(duplicatedIds.length === 0, "Page 1 và Page 2 bị trùng sản phẩm");
});
```

---

## 5. Mức độ bao phủ

Vì đây là kiểm thử Black-box API nên nhóm không đo line coverage hay branch coverage của mã nguồn.  
Mức độ bao phủ được đánh giá dựa trên các tag trong bảng lớp tương đương.

| Tag | Trường hợp kiểm thử | Trạng thái |
| --- | --- | --- |
| V1 | page: page 1 hợp lệ | Đã kiểm thử |
| V2 | page: page 2 hợp lệ | Đã kiểm thử |
| V3 | pageSize: pageSize hợp lệ | Đã kiểm thử |
| V4 | Dữ liệu phân trang: Page 1 và page 2 không trùng dữ liệu | Đã kiểm thử |
| X1 | page: page <= 0 | Chưa có test case |
| X2 | page: page sai định dạng | Chưa có test case |
| X3 | pageSize: pageSize <= 0 | Chưa có test case |
| X4 | Dữ liệu phân trang: Hai page bị trùng dữ liệu | Chưa có test case |

Kết quả:

| Nội dung | Giá trị |
| --- | --- |
| Tổng số tag cần kiểm thử | 8 |
| Số tag đã có test case | 4 |
| Tỷ lệ bao phủ theo tag | 50.00% |

Nhận xét:

API này hiện đã bao phủ được 4/8 tag đã thiết kế, tương ứng 50.00%. Các tag chưa có test case riêng là: `X1, X2, X3, X4`. Có thể bổ sung thêm sau để tăng mức độ bao phủ.


### Kết luận

Function/API này được kiểm thử theo hướng **Black-box API Testing** vì test chỉ gửi request vào endpoint và kiểm tra response trả về, không gọi trực tiếp mã nguồn bên trong.

---
