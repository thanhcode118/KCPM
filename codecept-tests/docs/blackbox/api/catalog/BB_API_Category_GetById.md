# Black-box API Test - Category GetById

## 1. Thông tin chung

| Nội dung | Giá trị |
| --- | --- |
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/catalog_api_test.js` |
| Function/API được test | `Category.GetById` |
| Method/Endpoint | `GET /api/categories/{id}` |
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
| id | id category tồn tại | V1 | id category không tồn tại | X1 |
| id | id là số nguyên dương | V2 | id sai định dạng | X2 |
| Category detail | Category có name và slug hợp lệ | V3 | Category thiếu name hoặc slug | X3 |

### Output cần kiểm tra

API trả về `2xx` và chi tiết category nếu id tồn tại. Nếu id không tồn tại thì nên trả `404 Not Found`.

---

## 2. Phân tích giá trị biên / biên dữ liệu API

Với API Catalog, không phải input nào cũng có miền số rõ ràng.  
Do đó, phần này kết hợp kiểm tra giá trị biên số và biên dữ liệu nghiệp vụ như rỗng, sai định dạng hoặc không tồn tại.

| Biến đầu vào | Giá trị hợp lệ đại diện | Giá trị biên / giá trị lỗi | Expected Output | Tag biên |
| --- | --- | --- | --- | --- |
| id | id category seed | `99999999` | `404 Not Found` | B1 |
| id | id seed | `abc` | `400` hoặc `404` tùy route | B2 |
| Category detail | name và slug không rỗng | name hoặc slug rỗng | Test fail | B3 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Lấy chi tiết danh mục theo id | `GET /api/categories/{categoryId}` với id tồn tại | `2xx`, category id đúng, name và slug không rỗng | API trả về chi tiết category đúng id | Pass | V1, V2, V3 |
| 2 | Category không tồn tại | `GET /api/categories/99999999` | `404 Not Found` | Chưa có trong file test hiện tại | Chưa kiểm thử | X1 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/catalog_api_test.js`:

```javascript
Scenario("Category GetById: lấy chi tiết danh mục theo id", async ({ I }) => {
  const seedCategory = await getSeedCategory(I);
  const categoryId = getCategoryId(seedCategory);

  const res = await I.sendGetRequest("/api/categories/" + categoryId);

  assert2xx(res, "GET category by id thất bại");

  const category = extractProduct(res.data);

  assert.strictEqual(getCategoryId(category), categoryId, "Category id trả về không đúng");
  assert(getCategoryName(category).length > 0, "Chi tiết category không có name");
  assert(getCategorySlug(category).length > 0, "Chi tiết category không có slug");
});
```

---

## 5. Mức độ bao phủ

Vì đây là kiểm thử Black-box API nên nhóm không đo line coverage hay branch coverage của mã nguồn.  
Mức độ bao phủ được đánh giá dựa trên các tag trong bảng lớp tương đương.

| Tag | Trường hợp kiểm thử | Trạng thái |
| --- | --- | --- |
| V1 | id: id category tồn tại | Đã kiểm thử |
| V2 | id: id là số nguyên dương | Đã kiểm thử |
| V3 | Category detail: Category có name và slug hợp lệ | Đã kiểm thử |
| X1 | id: id category không tồn tại | Chưa có test case |
| X2 | id: id sai định dạng | Chưa có test case |
| X3 | Category detail: Category thiếu name hoặc slug | Chưa có test case |

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
