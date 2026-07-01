# Black-box API Test - Product GetReviews

## 1. Thông tin chung

| Nội dung | Giá trị |
| --- | --- |
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/catalog_api_test.js` |
| Function/API được test | `Product.GetReviews` |
| Method/Endpoint | `GET /api/products/{id}/reviews` |
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
| productId | id sản phẩm tồn tại | V1 | id sản phẩm không tồn tại | X1 |
| reviews | Review trả về thuộc đúng productId | V2 | Review thuộc sai productId | X2 |
| reviews | Response là danh sách | V3 | Response không phải danh sách | X3 |

### Output cần kiểm tra

API trả về danh sách review của đúng sản phẩm. Danh sách có thể rỗng nhưng không được crash.

---

## 2. Phân tích giá trị biên / biên dữ liệu API

Với API Catalog, không phải input nào cũng có miền số rõ ràng.  
Do đó, phần này kết hợp kiểm tra giá trị biên số và biên dữ liệu nghiệp vụ như rỗng, sai định dạng hoặc không tồn tại.

| Biến đầu vào | Giá trị hợp lệ đại diện | Giá trị biên / giá trị lỗi | Expected Output | Tag biên |
| --- | --- | --- | --- | --- |
| productId | id sản phẩm seed | `99999999` | `404` hoặc danh sách rỗng | B1 |
| reviews | Array hợp lệ | Response không phải array | Test fail | B2 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Lấy danh sách review của sản phẩm | `GET /api/products/{productId}/reviews` | `2xx`, response là danh sách review, review thuộc đúng productId | API trả về danh sách review hợp lệ | Pass | V1, V2, V3 |
| 2 | Lấy review của sản phẩm không tồn tại | `GET /api/products/99999999/reviews` | `404` hoặc danh sách rỗng | Chưa có trong file test hiện tại | Chưa kiểm thử | X1 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/catalog_api_test.js`:

```javascript
Scenario("Product GetReviews: lấy danh sách review của sản phẩm", async ({ I }) => {
  const seedProduct = await getSeedProduct(I);
  const productId = getProductId(seedProduct);

  const res = await I.sendGetRequest("/api/products/" + productId + "/reviews");

  assert2xx(res, "GET reviews thất bại");

  const reviews = extractArray(res.data);

  assert(Array.isArray(reviews), "Danh sách review trả về không phải array");

  for (const review of reviews) {
    assert.strictEqual(
      toNumber(pick(review, "productId", "ProductId")),
      productId,
      "Review trả về không thuộc productId đang test"
    );
  }
});
```

---

## 5. Mức độ bao phủ

Vì đây là kiểm thử Black-box API nên nhóm không đo line coverage hay branch coverage của mã nguồn.  
Mức độ bao phủ được đánh giá dựa trên các tag trong bảng lớp tương đương.

| Tag | Trường hợp kiểm thử | Trạng thái |
| --- | --- | --- |
| V1 | productId: id sản phẩm tồn tại | Đã kiểm thử |
| V2 | reviews: Review trả về thuộc đúng productId | Đã kiểm thử |
| V3 | reviews: Response là danh sách | Đã kiểm thử |
| X1 | productId: id sản phẩm không tồn tại | Chưa có test case |
| X2 | reviews: Review thuộc sai productId | Chưa có test case |
| X3 | reviews: Response không phải danh sách | Chưa có test case |

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
