# Black-box API Test - Product Sort

## 1. Thông tin chung

| Nội dung | Giá trị |
| --- | --- |
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/catalog_api_test.js` |
| Function/API được test | `Product.Sort` |
| Method/Endpoint | `GET /api/products?sort=price-asc` |
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
| sort | `price-asc` | V1 | Giá trị sort không hợp lệ | X1 |
| sort | `price-desc` | V2 | sort rỗng | X2 |
| Dữ liệu sản phẩm | Có ít nhất 2 sản phẩm để so sánh | V3 | Không đủ dữ liệu để kiểm tra sort | X3 |

### Output cần kiểm tra

API trả về danh sách sản phẩm được sắp xếp đúng theo tiêu chí sort.

---

## 2. Phân tích giá trị biên / biên dữ liệu API

Với API Catalog, không phải input nào cũng có miền số rõ ràng.  
Do đó, phần này kết hợp kiểm tra giá trị biên số và biên dữ liệu nghiệp vụ như rỗng, sai định dạng hoặc không tồn tại.

| Biến đầu vào | Giá trị hợp lệ đại diện | Giá trị biên / giá trị lỗi | Expected Output | Tag biên |
| --- | --- | --- | --- | --- |
| sort | `price-asc` | `invalid-sort` | `400` hoặc trả mặc định an toàn | B1 |
| Số lượng sản phẩm | >= 2 sản phẩm | 0 hoặc 1 sản phẩm | Không đủ điều kiện so sánh | B2 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Sắp xếp sản phẩm theo giá tăng dần | `GET /api/products?sort=price-asc&page=1&pageSize=50` | `2xx`, giá sản phẩm tăng dần | API trả về danh sách tăng dần theo giá | Pass | V1, V3 |
| 2 | Sort không hợp lệ | `GET /api/products?sort=invalid-sort` | `400` hoặc trả mặc định an toàn | Chưa có trong file test hiện tại | Chưa kiểm thử | X1 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/catalog_api_test.js`:

```javascript
Scenario("Product Sort: sắp xếp sản phẩm theo giá tăng dần", async ({ I }) => {
  const { products } = await getProductList(I, "?sort=price-asc&page=1&pageSize=50");

  assert(products.length > 1, "Cần ít nhất 2 sản phẩm để kiểm tra sort");

  for (let i = 1; i < products.length; i++) {
    const previousPrice = getProductPrice(products[i - 1]);
    const currentPrice = getProductPrice(products[i]);

    assert(previousPrice <= currentPrice, "Sort price-asc sai");
  }
});
```

---

## 5. Mức độ bao phủ

Vì đây là kiểm thử Black-box API nên nhóm không đo line coverage hay branch coverage của mã nguồn.  
Mức độ bao phủ được đánh giá dựa trên các tag trong bảng lớp tương đương.

| Tag | Trường hợp kiểm thử | Trạng thái |
| --- | --- | --- |
| V1 | sort: `price-asc` | Đã kiểm thử |
| V2 | sort: `price-desc` | Chưa có test case |
| V3 | Dữ liệu sản phẩm: Có ít nhất 2 sản phẩm để so sánh | Đã kiểm thử |
| X1 | sort: Giá trị sort không hợp lệ | Chưa có test case |
| X2 | sort: sort rỗng | Chưa có test case |
| X3 | Dữ liệu sản phẩm: Không đủ dữ liệu để kiểm tra sort | Chưa có test case |

Kết quả:

| Nội dung | Giá trị |
| --- | --- |
| Tổng số tag cần kiểm thử | 6 |
| Số tag đã có test case | 2 |
| Tỷ lệ bao phủ theo tag | 33.33% |

Nhận xét:

API này hiện đã bao phủ được 2/6 tag đã thiết kế, tương ứng 33.33%. Các tag chưa có test case riêng là: `V2, X1, X2, X3`. Có thể bổ sung thêm sau để tăng mức độ bao phủ.


### Kết luận

Function/API này được kiểm thử theo hướng **Black-box API Testing** vì test chỉ gửi request vào endpoint và kiểm tra response trả về, không gọi trực tiếp mã nguồn bên trong.

---
