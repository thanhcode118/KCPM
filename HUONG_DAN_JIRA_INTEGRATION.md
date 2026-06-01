# Hướng Dẫn Tích Hợp Jenkins → Jira (Tự Động Tạo Bug)

## Tổng quan

Khi Jenkins build/test **thất bại**, pipeline sẽ tự động:
1. Thu thập log lỗi (stage nào fail, chi tiết lỗi)
2. Tạo **Bug** trên Jira với nội dung lỗi
3. Assign cho thành viên theo kiểu **round-robin** (luân phiên)

---

## Bước 1: Tạo Jira API Token

1. Đăng nhập Jira tại: https://nguyenhathanh844.atlassian.net
2. Truy cập: https://id.atlassian.com/manage-profile/security/api-tokens
3. Click **"Create API token"**
4. Đặt tên: `jenkins-integration`
5. **Copy token** → lưu lại (chỉ hiện 1 lần!)

⚠️ **KHÔNG hardcode token trong Jenkinsfile!** Sẽ lưu trong Jenkins Credentials ở bước 2.

---

## Bước 2: Lưu API Token vào Jenkins Credentials

1. Truy cập Jenkins: http://localhost:8080
2. Vào: **Manage Jenkins** → **Credentials** → **(global)** → **Add Credentials**
3. Điền:
   - **Kind**: `Secret text`
   - **Secret**: paste API Token vừa copy ở bước 1
   - **ID**: `jira-api-token` ← (phải đúng tên này!)
   - **Description**: `Jira API Token for auto bug report`
4. Click **Create**

---

## Bước 3: Cập nhật Email trong Jenkinsfile

Mở file `Jenkinsfile`, tìm dòng:
```groovy
JIRA_USER_EMAIL  = 'YOUR_JIRA_EMAIL@gmail.com'       // TODO: Thay email đăng nhập Jira của bạn
```

Thay `YOUR_JIRA_EMAIL@gmail.com` bằng **email bạn dùng đăng nhập Jira**.

---

## Bước 4: Tìm Account ID của 4 thành viên

### Cách 1: Dùng Jira UI
1. Vào Jira → click vào **avatar** của thành viên
2. Xem URL trên trình duyệt, dạng:
   ```
   https://nguyenhathanh844.atlassian.net/jira/people/712020:abcd1234-5678-efgh
                                                        ^^^^^^^^^^^^^^^^^^^^^^^^^
                                                        Đây là Account ID
   ```

### Cách 2: Dùng API (chính xác nhất)

Mở PowerShell, chạy lệnh sau (thay email và token):

```powershell
# Thay YOUR_EMAIL và YOUR_API_TOKEN
$email = "YOUR_EMAIL@gmail.com"
$token = "YOUR_API_TOKEN"

$base64 = [Convert]::ToBase64String(
    [Text.Encoding]::ASCII.GetBytes("${email}:${token}")
)

# Tìm tất cả users có thể assign
$response = Invoke-RestMethod `
    -Uri "https://nguyenhathanh844.atlassian.net/rest/api/3/user/assignable/search?project=HOM" `
    -Headers @{ 'Authorization' = "Basic $base64" }

# Hiển thị danh sách
$response | ForEach-Object {
    Write-Host "Name: $($_.displayName) | AccountID: $($_.accountId)"
}
```

Kết quả sẽ hiện dạng:
```
Name: Nguyen Ha Thanh | AccountID: 712020:abcd1234-5678-efgh
Name: Tran Van A       | AccountID: 712020:wxyz9876-5432-ijkl
...
```

### Cách 3: Mở trực tiếp link API trên trình duyệt

Đăng nhập Jira xong, mở link sau trên trình duyệt:
```
https://nguyenhathanh844.atlassian.net/rest/api/3/user/assignable/search?project=HOM
```

Tìm trường `"accountId"` của từng người.

---

## Bước 5: Điền Account ID vào Jenkinsfile

Mở file `Jenkinsfile`, tìm đoạn:
```groovy
def teamMembers = [
    'ACCOUNT_ID_MEMBER_1',   // Thành viên 1
    'ACCOUNT_ID_MEMBER_2',   // Thành viên 2
    'ACCOUNT_ID_MEMBER_3',   // Thành viên 3
    'ACCOUNT_ID_MEMBER_4'    // Thành viên 4
]
```

Thay bằng Account ID thật, ví dụ:
```groovy
def teamMembers = [
    '712020:abcd1234-5678-efgh',   // Nguyễn Hà Thanh
    '712020:wxyz9876-5432-ijkl',   // Trần Văn A
    '712020:mnop5555-1111-qrst',   // Lê Thị B
    '712020:uvwx2222-3333-yzab'    // Phạm Văn C
]
```

---

## Bước 6: Approve Script trong Jenkins (Bắt buộc)

Pipeline dùng `currentBuild.rawBuild.getLog()` → cần approve:

1. Vào Jenkins: **Manage Jenkins** → **In-process Script Approval**
2. Sẽ thấy pending approval cho `currentBuild.rawBuild.getLog()`
3. Click **Approve**

💡 Nếu chưa thấy, chạy build 1 lần rồi quay lại đây approve.

---

## Cách hoạt động Round-Robin

```
Build #1 fail → Assign cho Thành viên 1 (1 % 4 = 1)
Build #2 fail → Assign cho Thành viên 2 (2 % 4 = 2)
Build #3 fail → Assign cho Thành viên 3 (3 % 4 = 3)
Build #4 fail → Assign cho Thành viên 4 (4 % 4 = 0)
Build #5 fail → Assign cho Thành viên 1 (5 % 4 = 1)
... luân phiên tiếp ...
```

---

## Test thử

### Test Jira API trước (không cần Jenkins)

```powershell
$email = "YOUR_EMAIL@gmail.com"
$token = "YOUR_API_TOKEN"

$base64 = [Convert]::ToBase64String(
    [Text.Encoding]::ASCII.GetBytes("${email}:${token}")
)

$body = @"
{
    "fields": {
        "project": { "key": "HOM" },
        "summary": "[TEST] Jenkins Auto Bug Report - Xoa sau khi test",
        "description": {
            "version": 1,
            "type": "doc",
            "content": [
                {
                    "type": "paragraph",
                    "content": [
                        {
                            "type": "text",
                            "text": "Day la issue test tu Jenkins. Co the xoa."
                        }
                    ]
                }
            ]
        },
        "issuetype": { "name": "Bug" },
        "priority": { "name": "High" },
        "labels": ["auto-jenkins", "test"]
    }
}
"@

$response = Invoke-RestMethod `
    -Uri "https://nguyenhathanh844.atlassian.net/rest/api/3/issue" `
    -Method POST `
    -Headers @{ 'Authorization' = "Basic $base64" } `
    -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) `
    -ContentType 'application/json; charset=utf-8'

Write-Host "Issue created: $($response.key)"
Write-Host "Link: https://nguyenhathanh844.atlassian.net/browse/$($response.key)"
```

Nếu chạy thành công → thấy issue mới trên Jira board → tích hợp sẽ hoạt động!

---

## Checklist tóm tắt

- [ ] Tạo Jira API Token
- [ ] Lưu token vào Jenkins Credentials (ID: `jira-api-token`)
- [ ] Thay email trong Jenkinsfile
- [ ] Tìm và điền Account ID 4 thành viên
- [ ] Approve script trong Jenkins
- [ ] Test thử bằng PowerShell
- [ ] Chạy Jenkins build với lỗi cố ý để verify
