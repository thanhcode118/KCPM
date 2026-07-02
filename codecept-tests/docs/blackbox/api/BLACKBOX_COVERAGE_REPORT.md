# Black-box API Tag Coverage Report

## 1. Tổng quan

| Chỉ số | Kết quả |
|---|---:|
| Tổng số file .md | 10 |
| Tổng tag mục tiêu | 68 |
| Tổng tag đã cover | 37 |
| Overall tag coverage | 54.41% |

## 2. Chi tiết từng file

| File | Tag mục tiêu | Tag đã cover | Tag chưa cover | Coverage |
|---|---:|---:|---|---:|
| `BB_API_Account_GetProfile.md` | 3 | 2 | X2 | 66.67% |
| `BB_API_Account_UpdateProfile.md` | 7 | 5 | X1, X2 | 71.43% |
| `BB_API_Address_AddAddress.md` | 11 | 8 | X1, X2, X6 | 72.73% |
| `BB_API_Address_DeleteAddress.md` | 6 | 3 | X1, X2, X4 | 50.00% |
| `BB_API_Address_GetAddressById.md` | 6 | 1 | V1, V2, X1, X2, X4 | 16.67% |
| `BB_API_Address_GetAddresses.md` | 5 | 2 | X1, X2, X3 | 40.00% |
| `BB_API_Address_UpdateAddress.md` | 8 | 3 | X1, X2, X3, X4, X5 | 37.50% |
| `BB_API_Auth_ConfirmEmail.md` | 4 | 1 | V1, X2, X3 | 25.00% |
| `BB_API_Auth_Login.md` | 6 | 3 | X1, X2, X4 | 50.00% |
| `BB_API_Auth_Register.md` | 12 | 9 | X2, X3, X7 | 75.00% |


## 3. Ghi chú

Đây là **Black-box tag coverage**, không phải code coverage.

- Tag mục tiêu được lấy từ bảng lớp tương đương.
- Tag đã cover được lấy từ bảng test case có kết quả Pass.
- Những test case ghi "Chưa chạy" hoặc "Chưa có trong file hiện tại" không được tính là đã cover.
