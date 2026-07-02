# Black-box API Test - Product GetAll

## 1. Thông tin chung

| Nội dung | Giá trị |
| --- | --- |
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/catalog_api_test.js` |
| Function/API được test | `Product.GetAll/Search` |
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
| page | page là số nguyên >= 1 | V1 | page <= 0 | X1 |
| pageSize | pageSize là số nguyên hợp lệ | V2 | pageSize <= 0 hoặc quá lớn | X2 |
| Dữ liệu sản phẩm | Có dữ liệu sản phẩm sau khi seed | V3 | Không có dữ liệu sản phẩm | X3 |

### Output cần kiểm tra

API trả về `2xx`, danh sách sản phẩm và thông tin phân trang nếu input hợp lệ.

---

## 2. Phân tích giá trị biên / biên dữ liệu API

Với API Catalog, không phải input nào cũng có miền số rõ ràng.  
Do đó, phần này kết hợp kiểm tra giá trị biên số và biên dữ liệu nghiệp vụ như rỗng, sai định dạng hoặc không tồn tại.

| Biến đầu vào | Giá trị hợp lệ đại diện | Giá trị biên / giá trị lỗi | Expected Output | Tag biên |
| --- | --- | --- | --- | --- |
| page | `1` | `0` | `400` hoặc xử lý an toàn | B1 |
| pageSize | `20` | `0` | `400` hoặc xử lý an toàn | B2 |
| pageSize | `20` | `9999` | Không crash | B3 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Lấy danh sách sản phẩm thành công | `GET /api/products?page=1&pageSize=20` | `2xx`, danh sách có sản phẩm, productId và tên hợp lệ | API trả về danh sách sản phẩm hợp lệ | Pass | V1, V2, V3 |
| 2 | page không hợp lệ | `GET /api/products?page=0&pageSize=20` | `400` hoặc xử lý an toàn | Chưa có trong file test hiện tại | Chưa kiểm thử | X1 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/catalog_api_test.js`:

```javascript
Scenario("Product GetAll/Search: lấy danh sách sản phẩm thành công", async ({ I }) => {
  const { res, products } = await getProductList(I, "?page=1&pageSize=20");

  assert(products.length > 0, "API /api/products không trả về sản phẩm nào");

  const firstProduct = products[0];

  assert(getProductId(firstProduct) > 0, "Sản phẩm đầu tiên không có productId hợp lệ");
  assert(getProductName(firstProduct).length > 0, "Sản phẩm đầu tiên không có tên");
});
```

---

## 5. Mức độ bao phủ

Vì đây là kiểm thử Black-box API nên nhóm không đo line coverage hay branch coverage của mã nguồn.  
Mức độ bao phủ được đánh giá dựa trên các tag trong bảng lớp tương đương.

| Tag | Trường hợp kiểm thử | Trạng thái |
| --- | --- | --- |
| V1 | page: page là số nguyên >= 1 | Đã kiểm thử |
| V2 | pageSize: pageSize là số nguyên hợp lệ | Đã kiểm thử |
| V3 | Dữ liệu sản phẩm: Có dữ liệu sản phẩm sau khi seed | Đã kiểm thử |
| X1 | page: page <= 0 | Chưa có test case |
| X2 | pageSize: pageSize <= 0 hoặc quá lớn | Chưa có test case |
| X3 | Dữ liệu sản phẩm: Không có dữ liệu sản phẩm | Chưa có test case |

Kết quả:

| Nội dung | Giá trị |
| --- | --- |
| Tổng số tag cần kiểm thử | 6 |
| Số tag đã có test case | 3 |
| Tỷ lệ bao phủ theo tag | 50.00% |

Nhận xét:

API này hiện đã bao phủ được 3/6 tag đã thiết kế, tương ứng 50.00%. Các tag chưa có test case riêng là: `X1, X2, X3`. Có thể bổ sung thêm sau để tăng mức độ bao phủ.


### Kết luận

Function/API này được kiểm thử theo hướng **Black-box API Testing** vì test chỉ gửi request vào endpoint và kiểm tra response trả về, không gọi trực tiếp mã nguồn bên trong.

---
