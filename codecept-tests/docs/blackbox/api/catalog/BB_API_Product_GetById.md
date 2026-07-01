# Black-box API Test - Product GetById

## 1. Thông tin chung

| Nội dung | Giá trị |
| --- | --- |
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/catalog_api_test.js` |
| Function/API được test | `Product.GetById` |
| Method/Endpoint | `GET /api/products/{id}` |
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
| id | id sản phẩm tồn tại | V1 | id sản phẩm không tồn tại | X1 |
| id | id là số nguyên dương | V2 | id sai định dạng | X2 |
| Dữ liệu sản phẩm | Sản phẩm có tên và productId hợp lệ | V3 | Sản phẩm thiếu dữ liệu bắt buộc | X3 |

### Output cần kiểm tra

API trả về `2xx` và chi tiết sản phẩm nếu id tồn tại. Nếu id không tồn tại thì trả về `404 Not Found`.

---

## 2. Phân tích giá trị biên / biên dữ liệu API

Với API Catalog, không phải input nào cũng có miền số rõ ràng.  
Do đó, phần này kết hợp kiểm tra giá trị biên số và biên dữ liệu nghiệp vụ như rỗng, sai định dạng hoặc không tồn tại.

| Biến đầu vào | Giá trị hợp lệ đại diện | Giá trị biên / giá trị lỗi | Expected Output | Tag biên |
| --- | --- | --- | --- | --- |
| id | id lấy từ sản phẩm seed | `99999999` | `404 Not Found` | B1 |
| id | id seed | `abc` | `400` hoặc `404` tùy route | B2 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Lấy chi tiết sản phẩm theo id | `GET /api/products/{productId}` với id tồn tại | `2xx`, productId đúng, tên sản phẩm không rỗng | API trả về chi tiết sản phẩm đúng id | Pass | V1, V2, V3 |
| 2 | Sản phẩm không tồn tại | `GET /api/products/99999999` | `404 Not Found` | API trả về `404 Not Found` | Pass | X1 |
| 3 | id sai định dạng | `GET /api/products/abc` | `400` hoặc `404`, không crash | Chưa có trong file test hiện tại | Chưa kiểm thử | X2 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/catalog_api_test.js`:

```javascript
Scenario("Product GetById: lấy chi tiết sản phẩm theo id", async ({ I }) => {
  const seedProduct = await getSeedProduct(I);
  const productId = getProductId(seedProduct);

  const res = await I.sendGetRequest("/api/products/" + productId);

  assert2xx(res, "GET product by id thất bại");

  const product = extractProduct(res.data);

  assert.strictEqual(getProductId(product), productId, "ProductId trả về không đúng");
  assert(getProductName(product).length > 0, "Chi tiết sản phẩm không có productName");
});

Scenario("Product GetById not found: sản phẩm không tồn tại phải trả về 404", async ({ I }) => {
  const res = await I.sendGetRequest("/api/products/99999999");

  assertStatus(res, 404, "Product không tồn tại phải trả về 404");
});
```

---

## 5. Mức độ bao phủ

Vì đây là kiểm thử Black-box API nên nhóm không đo line coverage hay branch coverage của mã nguồn.  
Mức độ bao phủ được đánh giá dựa trên các tag trong bảng lớp tương đương.

| Tag | Trường hợp kiểm thử | Trạng thái |
| --- | --- | --- |
| V1 | id: id sản phẩm tồn tại | Đã kiểm thử |
| V2 | id: id là số nguyên dương | Đã kiểm thử |
| V3 | Dữ liệu sản phẩm: Sản phẩm có tên và productId hợp lệ | Đã kiểm thử |
| X1 | id: id sản phẩm không tồn tại | Đã kiểm thử |
| X2 | id: id sai định dạng | Chưa có test case |
| X3 | Dữ liệu sản phẩm: Sản phẩm thiếu dữ liệu bắt buộc | Chưa có test case |

Kết quả:

| Nội dung | Giá trị |
| --- | --- |
| Tổng số tag cần kiểm thử | 6 |
| Số tag đã có test case | 4 |
| Tỷ lệ bao phủ theo tag | 66.67% |

Nhận xét:

API này hiện đã bao phủ được 4/6 tag đã thiết kế, tương ứng 66.67%. Các tag chưa có test case riêng là: `X2, X3`. Có thể bổ sung thêm sau để tăng mức độ bao phủ.


### Kết luận

Function/API này được kiểm thử theo hướng **Black-box API Testing** vì test chỉ gửi request vào endpoint và kiểm tra response trả về, không gọi trực tiếp mã nguồn bên trong.

---
