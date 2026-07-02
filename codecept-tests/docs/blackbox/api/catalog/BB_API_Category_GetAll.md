# Black-box API Test - Category GetAll

## 1. Thông tin chung

| Nội dung | Giá trị |
| --- | --- |
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/catalog_api_test.js` |
| Function/API được test | `Category.GetAll` |
| Method/Endpoint | `GET /api/categories` |
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
| Dữ liệu category | Có dữ liệu category sau khi seed | V1 | Không có dữ liệu category | X1 |
| Category item | Category có id hợp lệ | V2 | Category thiếu id | X2 |
| Category item | Category có name hợp lệ | V3 | Category thiếu name | X3 |

### Output cần kiểm tra

API trả về `2xx` và danh sách danh mục. Mỗi category cần có id và name hợp lệ.

---

## 2. Phân tích giá trị biên / biên dữ liệu API

Với API Catalog, không phải input nào cũng có miền số rõ ràng.  
Do đó, phần này kết hợp kiểm tra giá trị biên số và biên dữ liệu nghiệp vụ như rỗng, sai định dạng hoặc không tồn tại.

| Biến đầu vào | Giá trị hợp lệ đại diện | Giá trị biên / giá trị lỗi | Expected Output | Tag biên |
| --- | --- | --- | --- | --- |
| Dữ liệu category | Có ít nhất 1 category | Danh sách rỗng | `2xx` với mảng rỗng hoặc test fail tùy mục tiêu | B1 |
| Category item | id > 0 và name không rỗng | id null hoặc name rỗng | Test fail | B2 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Lấy danh sách danh mục thành công | `GET /api/categories` | `2xx`, danh sách category có dữ liệu, category đầu tiên có id và name | API trả về danh sách category hợp lệ | Pass | V1, V2, V3 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/catalog_api_test.js`:

```javascript
Scenario("Category GetAll: lấy danh sách danh mục thành công", async ({ I }) => {
  const { categories } = await getCategoryList(I);

  assert(categories.length > 0, "API /api/categories không trả về category nào");

  const firstCategory = categories[0];

  assert(getCategoryId(firstCategory) > 0, "Category đầu tiên không có id hợp lệ");
  assert(getCategoryName(firstCategory).length > 0, "Category đầu tiên không có name");
});
```

---

## 5. Mức độ bao phủ

Vì đây là kiểm thử Black-box API nên nhóm không đo line coverage hay branch coverage của mã nguồn.  
Mức độ bao phủ được đánh giá dựa trên các tag trong bảng lớp tương đương.

| Tag | Trường hợp kiểm thử | Trạng thái |
| --- | --- | --- |
| V1 | Dữ liệu category: Có dữ liệu category sau khi seed | Đã kiểm thử |
| V2 | Category item: Category có id hợp lệ | Đã kiểm thử |
| V3 | Category item: Category có name hợp lệ | Đã kiểm thử |
| X1 | Dữ liệu category: Không có dữ liệu category | Chưa có test case |
| X2 | Category item: Category thiếu id | Chưa có test case |
| X3 | Category item: Category thiếu name | Chưa có test case |

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
