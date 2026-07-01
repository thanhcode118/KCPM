# Black-box API Test - Product AddReview

## 1. Thông tin chung

| Nội dung | Giá trị |
| --- | --- |
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/catalog_api_test.js` |
| Function/API được test | `Product.AddReview` |
| Method/Endpoint | `POST /api/products/{id}/reviews` |
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
| Authorization token | Token user hợp lệ | V1 | Không có token hoặc token sai | X1 |
| productId | id sản phẩm tồn tại | V2 | id sản phẩm không tồn tại | X2 |
| rating | rating nằm trong khoảng 1 đến 5 | V3 | rating ngoài khoảng 1 đến 5 | X3 |
| comment | comment không rỗng | V4 | comment rỗng | X4 |

### Output cần kiểm tra

API cho phép user đăng nhập thêm review cho sản phẩm hợp lệ. Response cần đúng productId, rating và comment.

---

## 2. Phân tích giá trị biên / biên dữ liệu API

Với API Catalog, không phải input nào cũng có miền số rõ ràng.  
Do đó, phần này kết hợp kiểm tra giá trị biên số và biên dữ liệu nghiệp vụ như rỗng, sai định dạng hoặc không tồn tại.

| Biến đầu vào | Giá trị hợp lệ đại diện | Giá trị biên / giá trị lỗi | Expected Output | Tag biên |
| --- | --- | --- | --- | --- |
| rating | `5` | `0` hoặc `6` | `400 Bad Request` | B1 |
| comment | Chuỗi hợp lệ | Chuỗi rỗng | `400 Bad Request` | B2 |
| Authorization token | Token hợp lệ | Không gửi token | `401 Unauthorized` | B3 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | User đăng nhập thêm review cho sản phẩm | `POST /api/products/{productId}/reviews` kèm token, rating=5, comment hợp lệ | `2xx`, review trả về đúng productId, rating và comment | API tạo review thành công và dữ liệu trả về đúng | Pass | V1, V2, V3, V4 |
| 2 | AddReview không có token | `POST /api/products/{productId}/reviews` không gửi token | `401 Unauthorized` | Chưa có trong file test hiện tại | Chưa kiểm thử | X1 |
| 3 | AddReview rating ngoài khoảng | `POST /api/products/{productId}/reviews` với rating=6 | `400 Bad Request` | Chưa có trong file test hiện tại | Chưa kiểm thử | X3 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/catalog_api_test.js`:

```javascript
Scenario("Product AddReview: user đăng nhập có thể thêm review cho sản phẩm", async ({ I }) => {
  const customer = await registerNewCustomer(I);
  const seedProduct = await getSeedProduct(I);
  const productId = getProductId(seedProduct);

  const payload = {
    productId,
    author: customer.fullName,
    rating: 5,
    comment: "Codecept catalog review " + uniqueSuffix(),
  };

  const res = await I.sendPostRequest(
    "/api/products/" + productId + "/reviews",
    payload,
    authHeaders(customer.token)
  );

  assert2xx(res, "POST review thất bại");

  const review = extractReview(res.data);

  assert.strictEqual(toNumber(pick(review, "productId", "ProductId")), productId);
  assert.strictEqual(Number(pick(review, "rating", "Rating")), payload.rating);
  assert.strictEqual(String(pick(review, "comment", "Comment")), payload.comment);
});
```

---

## 5. Mức độ bao phủ

Vì đây là kiểm thử Black-box API nên nhóm không đo line coverage hay branch coverage của mã nguồn.  
Mức độ bao phủ được đánh giá dựa trên các tag trong bảng lớp tương đương.

| Tag | Trường hợp kiểm thử | Trạng thái |
| --- | --- | --- |
| V1 | Authorization token: Token user hợp lệ | Đã kiểm thử |
| V2 | productId: id sản phẩm tồn tại | Đã kiểm thử |
| V3 | rating: rating nằm trong khoảng 1 đến 5 | Đã kiểm thử |
| V4 | comment: comment không rỗng | Đã kiểm thử |
| X1 | Authorization token: Không có token hoặc token sai | Chưa có test case |
| X2 | productId: id sản phẩm không tồn tại | Chưa có test case |
| X3 | rating: rating ngoài khoảng 1 đến 5 | Chưa có test case |
| X4 | comment: comment rỗng | Chưa có test case |

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
