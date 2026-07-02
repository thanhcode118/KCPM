# Bộ tài liệu Markdown cho auth_account_api_test.js

## Danh sách file theo từng function/API

| STT | File .md | Function/API |
| --- | --- | --- |
| 1 | `BB_API_Auth_Register.md` | `Auth.Register` |
| 2 | `BB_API_Auth_Login.md` | `Auth.Login` |
| 3 | `BB_API_Auth_ConfirmEmail.md` | `Auth.ConfirmEmail` |
| 4 | `BB_API_Account_GetProfile.md` | `Account.GetProfile` |
| 5 | `BB_API_Account_UpdateProfile.md` | `Account.UpdateProfile` |
| 6 | `BB_API_Address_AddAddress.md` | `Address.AddAddress` |
| 7 | `BB_API_Address_GetAddresses.md` | `Address.GetAddresses` |
| 8 | `BB_API_Address_GetAddressById.md` | `Address.GetAddressById` |
| 9 | `BB_API_Address_UpdateAddress.md` | `Address.UpdateAddress` |
| 10 | `BB_API_Address_DeleteAddress.md` | `Address.DeleteAddress` |

## Ghi chú

Các file này được viết theo hướng Black-box API Testing:

- Input là HTTP request: method, endpoint, headers, body.
- Output là HTTP response: status code và response body.
- Actual Output dựa trên kết quả chạy: `OK | 11 passed`.
- Một vài nhánh hợp lệ/chưa có trong test hiện tại được ghi rõ là `Chưa có trong file hiện tại`.
