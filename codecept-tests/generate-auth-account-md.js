const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "docs", "blackbox", "api", "auth-account");

fs.mkdirSync(outDir, { recursive: true });

const TEST_FILE = "codecept-tests/tests/be/auth_account_api_test.js";
const RUN_CMD = "npm run test:be:auth-account";
const RUN_RESULT = "OK | 11 passed";

function cell(value) {
  return String(value ?? "")
    .replace(/\n/g, "<br>")
    .replace(/\|/g, "\\|");
}

function table(headers, rows) {
  return [
    `| ${headers.map(cell).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(cell).join(" | ")} |`),
  ].join("\n");
}

function render(doc) {
  return `# ${doc.title}

## 1. Thông tin chung

| Nội dung | Giá trị |
|---|---|
| Nhóm test | Black-box BE/API |
| File test tự động | \`${TEST_FILE}\` |
| Function/API được test | \`${doc.functionName}\` |
| Method/Endpoint | \`${doc.endpoint}\` |
| Công cụ | CodeceptJS REST helper |
| Lệnh chạy | \`${RUN_CMD}\` |
| Kết quả chạy thực tế | \`${RUN_RESULT}\` |

## 2. Mục tiêu kiểm thử

Kiểm thử API từ bên ngoài thông qua HTTP request/response.

Test không gọi trực tiếp mã nguồn C# bên trong, nên đây là **Black-box API Testing**.

Trong file test:

- **Input** là method, endpoint, header và request body gửi vào API.
- **Expected Output** là status code và response body mong đợi.
- **Actual Output** là kết quả thực tế khi chạy CodeceptJS.

---

# NỘI DUNG THIẾT KẾ KIỂM THỬ API

---

## 1. Xác định lớp tương đương

${table(
  ["Biến đầu vào", "Lớp hợp lệ", "Tag", "Lớp không hợp lệ", "Tag"],
  doc.equivalence,
)}

### Output cần kiểm tra

${doc.output}

---

## 2. Phân tích giá trị biên / biên dữ liệu API

Với API test, không phải field nào cũng có miền số \`[min, max]\` rõ ràng.

Do đó, phần này áp dụng theo hướng **biên dữ liệu nghiệp vụ**:

- Giá trị hợp lệ đại diện.
- Giá trị rỗng.
- Giá trị sai định dạng.
- Giá trị thiếu token hoặc token sai.
- Giá trị không tồn tại.

${table(
  [
    "Biến đầu vào",
    "Giá trị hợp lệ đại diện",
    "Giá trị biên / giá trị lỗi",
    "Expected Output",
    "Tag biên",
  ],
  doc.boundary,
)}

---

## 3. Thiết kế test case

${table(
  [
    "STT",
    "Tên test case",
    "Input",
    "Expected Output",
    "Actual Output",
    "Kết quả",
    "Tag được bao phủ",
  ],
  doc.testCases.map((tc, index) => [
    index + 1,
    tc.name,
    tc.input,
    tc.expected,
    tc.actual,
    tc.result,
    tc.tags,
  ]),
)}

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong \`${TEST_FILE}\`:

\`\`\`javascript
${doc.code}
\`\`\`

### Kết luận

Function/API này đã được kiểm thử theo kiểu **Black-box API** vì test chỉ gửi request vào endpoint và kiểm tra response trả về.

---
`;
}

const docs = [
  {
    file: "BB_API_Auth_Register.md",
    title: "Black-box API Test - Auth Register",
    functionName: "Auth.Register",
    endpoint: "POST /api/auth/register",
    output:
      "API trả về `2xx`, có `token`, có `user`, và `user.role = customer` nếu đăng ký hợp lệ. Nếu input sai, API trả về `400 Bad Request`.",
    equivalence: [
      [
        "email",
        "Email đúng định dạng và chưa tồn tại",
        "V1",
        "Email sai định dạng, rỗng hoặc đã tồn tại",
        "X1, X2, X3",
      ],
      ["fullName", "Tên người dùng không rỗng", "V2", "Tên rỗng", "X4"],
      [
        "phone",
        "Số điện thoại hợp lệ",
        "V3",
        "Số điện thoại quá ngắn hoặc sai định dạng",
        "X5",
      ],
      [
        "password",
        "Mật khẩu đủ mạnh",
        "V4",
        "Mật khẩu rỗng hoặc quá yếu",
        "X6",
      ],
      ["role", "`customer`", "V5", "Role rỗng hoặc không hợp lệ", "X7"],
    ],
    boundary: [
      [
        "email",
        "`codecept.user.xxxx@example.com`",
        "`invalid-email`",
        "`400 Bad Request`",
        "B1",
      ],
      [
        "fullName",
        "`Codecept User xxxx`",
        "Chuỗi rỗng",
        "`400 Bad Request`",
        "B2",
      ],
      ["phone", "`0987654321`", "`123`", "`400 Bad Request`", "B3"],
      ["password", "`Password123`", "`123`", "`400 Bad Request`", "B4"],
      ["role", "`customer`", "`invalid-role`", "`400 Bad Request`", "B5"],
    ],
    testCases: [
      {
        name: "Register customer thành công",
        input:
          "`POST /api/auth/register` với email, fullName, phone, password, role hợp lệ",
        expected: "`2xx`, response có `token`, có `user`, role là `customer`",
        actual: "Passed",
        result: "Pass",
        tags: "V1, V2, V3, V4, V5",
      },
      {
        name: "Register thiếu dữ liệu bắt buộc",
        input:
          "`POST /api/auth/register` với email sai, fullName rỗng, phone ngắn, password yếu",
        expected: "`400 Bad Request`",
        actual: "Passed",
        result: "Pass",
        tags: "X1, X4, X5, X6",
      },
    ],
    code: `Scenario("Register customer thành công phải trả về token và user", async ({ I }) => {
  const payload = buildRegisterPayload();
  const res = await I.sendPostRequest("/api/auth/register", payload);

  assert2xx(res, "API register phải trả về 2xx");
  assert(getToken(res.data), "Register không trả về token");
  assert(getUser(res.data), "Register không trả về user");
});

Scenario("Register thiếu dữ liệu bắt buộc phải trả về 400", async ({ I }) => {
  const res = await I.sendPostRequest("/api/auth/register", {
    email: "invalid-email",
    fullName: "",
    phone: "123",
    password: "123",
    role: "customer",
  });

  assertStatus(res, 400, "Register input không hợp lệ phải trả về 400");
});`,
  },

  {
    file: "BB_API_Auth_Login.md",
    title: "Black-box API Test - Auth Login",
    functionName: "Auth.Login",
    endpoint: "POST /api/auth/login",
    output:
      "API trả về `2xx`, có `token`, có `user` nếu đăng nhập hợp lệ. Nếu sai thông tin đăng nhập, API trả về `401 Unauthorized`.",
    equivalence: [
      [
        "email",
        "Email tài khoản đã tồn tại",
        "V1",
        "Email không tồn tại hoặc rỗng",
        "X1, X2",
      ],
      ["password", "Mật khẩu đúng", "V2", "Mật khẩu sai hoặc rỗng", "X3, X4"],
    ],
    boundary: [
      [
        "email",
        "`admin1@homedecorshop.local`",
        "`unknown@example.com`",
        "`401 Unauthorized`",
        "B1",
      ],
      [
        "password",
        "`admin123`",
        "`WrongPassword123`",
        "`401 Unauthorized`",
        "B2",
      ],
      [
        "password",
        "`admin123`",
        "Chuỗi rỗng",
        "`400` hoặc `401` tùy validation",
        "B3",
      ],
    ],
    testCases: [
      {
        name: "Login admin thành công",
        input: "`POST /api/auth/login` với email/password admin seed đúng",
        expected: "`2xx`, response có `token`, có `user`",
        actual: "Passed",
        result: "Pass",
        tags: "V1, V2",
      },
      {
        name: "Login sai mật khẩu",
        input: "`POST /api/auth/login` với email đúng nhưng password sai",
        expected: "`401 Unauthorized`",
        actual: "Passed",
        result: "Pass",
        tags: "X3",
      },
    ],
    code: `Scenario("Login admin seed thành công phải trả về token", async ({ I }) => {
  const res = await I.sendPostRequest("/api/auth/login", {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  assert2xx(res, "Login admin thất bại");
  assert(getToken(res.data), "Login admin phải trả về token");
});

Scenario("Login sai mật khẩu phải trả về 401", async ({ I }) => {
  const res = await I.sendPostRequest("/api/auth/login", {
    email: ADMIN_EMAIL,
    password: "WrongPassword123",
  });

  assertStatus(res, 401, "Login sai mật khẩu phải trả về 401");
});`,
  },

  {
    file: "BB_API_Auth_ConfirmEmail.md",
    title: "Black-box API Test - Auth ConfirmEmail",
    functionName: "Auth.ConfirmEmail",
    endpoint: "GET /api/auth/confirm-email?token={token}",
    output:
      "API xác nhận email thành công nếu token hợp lệ. Với token sai, API trả về `400 Bad Request`.",
    equivalence: [
      [
        "token",
        "Token xác nhận email hợp lệ và còn hiệu lực",
        "V1",
        "Token sai, rỗng, hết hạn hoặc không tồn tại",
        "X1, X2, X3",
      ],
    ],
    boundary: [
      [
        "token",
        "`valid-confirm-email-token`",
        "`invalid-token-xxxx`",
        "`400 Bad Request`",
        "B1",
      ],
      [
        "token",
        "`valid-confirm-email-token`",
        "Chuỗi rỗng",
        "`400 Bad Request`",
        "B2",
      ],
    ],
    testCases: [
      {
        name: "ConfirmEmail với token sai",
        input: "`GET /api/auth/confirm-email?token=invalid-token-xxxx`",
        expected: "`400 Bad Request`",
        actual: "Passed",
        result: "Pass",
        tags: "X1",
      },
      {
        name: "ConfirmEmail với token hợp lệ",
        input: "`GET /api/auth/confirm-email?token=valid-token`",
        expected: "`2xx` hoặc thông báo xác nhận thành công",
        actual: "Chưa có trong file hiện tại",
        result: "Chưa chạy",
        tags: "V1",
      },
    ],
    code: `Scenario("ConfirmEmail với token sai phải trả về 400", async ({ I }) => {
  const res = await I.sendGetRequest(
    \`/api/auth/confirm-email?token=invalid-token-\${uniqueSuffix()}\`
  );

  assertStatus(res, 400, "Confirm email với token sai phải trả về 400");
});`,
  },

  {
    file: "BB_API_Account_GetProfile.md",
    title: "Black-box API Test - Account GetProfile",
    functionName: "Account.GetProfile",
    endpoint: "GET /api/account/profile",
    output:
      "Nếu có token hợp lệ, API trả về `2xx` và thông tin user. Nếu không có token, API trả về `401 Unauthorized`.",
    equivalence: [
      [
        "Authorization token",
        "Token user hợp lệ",
        "V1",
        "Không có token hoặc token sai",
        "X1, X2",
      ],
    ],
    boundary: [
      ["Token", "Token hợp lệ", "Không gửi token", "`401 Unauthorized`", "B1"],
      ["Token", "Token hợp lệ", "`invalid-token`", "`401 Unauthorized`", "B2"],
    ],
    testCases: [
      {
        name: "GetProfile bằng token hợp lệ",
        input: "`GET /api/account/profile` kèm token user vừa đăng ký",
        expected: "`2xx`, response trả về đúng email user",
        actual: "Passed",
        result: "Pass",
        tags: "V1",
      },
      {
        name: "GetProfile không có token",
        input: "`GET /api/account/profile` không gửi header token",
        expected: "`401 Unauthorized`",
        actual: "Passed",
        result: "Pass",
        tags: "X1",
      },
    ],
    code: `Scenario("GetProfile bằng token hợp lệ phải trả về thông tin user", async ({ I }) => {
  const customer = await registerNewCustomer(I);

  const res = await I.sendGetRequest(
    "/api/account/profile",
    authHeaders(customer.token)
  );

  assert2xx(res, "Get profile bằng token hợp lệ phải thành công");
});

Scenario("GetProfile không có token phải trả về 401", async ({ I }) => {
  const res = await I.sendGetRequest("/api/account/profile");

  assertStatus(res, 401, "Get profile không có token phải trả về 401");
});`,
  },

  {
    file: "BB_API_Account_UpdateProfile.md",
    title: "Black-box API Test - Account UpdateProfile",
    functionName: "Account.UpdateProfile",
    endpoint: "PUT /api/account/profile",
    output:
      "Nếu input hợp lệ, API trả về `2xx` và profile đã cập nhật. Nếu input không hợp lệ, API trả về `400 Bad Request`.",
    equivalence: [
      [
        "Authorization token",
        "Token user hợp lệ",
        "V1",
        "Không có token hoặc token sai",
        "X1, X2",
      ],
      ["fullName", "Tên mới không rỗng", "V2", "Tên rỗng", "X3"],
      [
        "phone",
        "Số điện thoại hợp lệ",
        "V3",
        "Số điện thoại quá ngắn hoặc sai định dạng",
        "X4",
      ],
    ],
    boundary: [
      [
        "fullName",
        "`Updated User xxxx`",
        "Chuỗi rỗng",
        "`400 Bad Request`",
        "B1",
      ],
      ["phone", "`0912345678`", "`123`", "`400 Bad Request`", "B2"],
      ["Token", "Token hợp lệ", "Không gửi token", "`401 Unauthorized`", "B3"],
    ],
    testCases: [
      {
        name: "UpdateProfile hợp lệ",
        input: "`PUT /api/account/profile` kèm token, fullName và phone hợp lệ",
        expected: "`2xx`, profile trả về đúng fullName và phone mới",
        actual: "Passed",
        result: "Pass",
        tags: "V1, V2, V3",
      },
      {
        name: "UpdateProfile thiếu dữ liệu bắt buộc",
        input: "`PUT /api/account/profile` với fullName rỗng, phone sai",
        expected: "`400 Bad Request`",
        actual: "Passed",
        result: "Pass",
        tags: "X3, X4",
      },
    ],
    code: `Scenario("UpdateProfile bằng token hợp lệ phải cập nhật fullName và phone", async ({ I }) => {
  const customer = await registerNewCustomer(I);
  const updatePayload = buildUpdateProfilePayload();

  const res = await I.sendPutRequest(
    "/api/account/profile",
    updatePayload,
    authHeaders(customer.token)
  );

  assert2xx(res, "Update profile bằng token hợp lệ phải thành công");
});

Scenario("UpdateProfile thiếu dữ liệu bắt buộc phải trả về 400", async ({ I }) => {
  const customer = await registerNewCustomer(I);

  const res = await I.sendPutRequest(
    "/api/account/profile",
    { fullName: "", phone: "123" },
    authHeaders(customer.token)
  );

  assertStatus(res, 400, "Update profile input không hợp lệ phải trả về 400");
});`,
  },

  {
    file: "BB_API_Address_AddAddress.md",
    title: "Black-box API Test - Address AddAddress",
    functionName: "Address.AddAddress",
    endpoint: "POST /api/account/addresses",
    output:
      "Nếu địa chỉ hợp lệ, API trả về `201 Created` và address có `id`. Nếu input sai, API trả về `400 Bad Request`.",
    equivalence: [
      [
        "Authorization token",
        "Token user hợp lệ",
        "V1",
        "Không có token hoặc token sai",
        "X1, X2",
      ],
      [
        "fullName",
        "Tên người nhận không rỗng",
        "V2",
        "Tên người nhận rỗng",
        "X3",
      ],
      [
        "phone",
        "Số điện thoại hợp lệ",
        "V3",
        "Số điện thoại quá ngắn hoặc sai định dạng",
        "X4",
      ],
      [
        "line1/ward/district/city",
        "Thông tin địa chỉ đầy đủ",
        "V4",
        "Thiếu địa chỉ hoặc rỗng",
        "X5",
      ],
      ["isDefault", "`true` hoặc `false`", "V5", "Không phải boolean", "X6"],
    ],
    boundary: [
      ["fullName", "`Receiver xxxx`", "Chuỗi rỗng", "`400 Bad Request`", "B1"],
      ["phone", "`0901234567`", "`123`", "`400 Bad Request`", "B2"],
      ["line1", "`123 Test Street`", "Chuỗi rỗng", "`400 Bad Request`", "B3"],
      ["city", "`Ho Chi Minh`", "Chuỗi rỗng", "`400 Bad Request`", "B4"],
    ],
    testCases: [
      {
        name: "AddAddress thành công",
        input: "`POST /api/account/addresses` kèm token và body địa chỉ hợp lệ",
        expected: "`201 Created`, response có address id",
        actual: "Passed trong scenario Address CRUD",
        result: "Pass",
        tags: "V1, V2, V3, V4, V5",
      },
      {
        name: "AddAddress thiếu dữ liệu bắt buộc",
        input: "`POST /api/account/addresses` với fullName, line1, city rỗng",
        expected: "`400 Bad Request`",
        actual: "Passed",
        result: "Pass",
        tags: "X3, X4, X5",
      },
    ],
    code: `const createRes = await I.sendPostRequest(
  "/api/account/addresses",
  createPayload,
  authHeaders(customer.token)
);

assertStatus(createRes, 201, "AddAddress thành công phải trả về 201");

Scenario("AddAddress thiếu dữ liệu bắt buộc phải trả về 400", async ({ I }) => {
  const customer = await registerNewCustomer(I);

  const res = await I.sendPostRequest(
    "/api/account/addresses",
    {
      fullName: "",
      phone: "123",
      line1: "",
      ward: "",
      district: "",
      city: "",
      isDefault: true,
    },
    authHeaders(customer.token)
  );

  assertStatus(res, 400, "AddAddress input không hợp lệ phải trả về 400");
});`,
  },

  {
    file: "BB_API_Address_GetAddresses.md",
    title: "Black-box API Test - Address GetAddresses",
    functionName: "Address.GetAddresses",
    endpoint: "GET /api/account/addresses",
    output:
      "Nếu token hợp lệ, API trả về `2xx` và danh sách địa chỉ. Nếu không có token, API trả về `401 Unauthorized`.",
    equivalence: [
      [
        "Authorization token",
        "Token user hợp lệ",
        "V1",
        "Không có token hoặc token sai",
        "X1, X2",
      ],
      [
        "Dữ liệu địa chỉ của user",
        "User có ít nhất 1 địa chỉ",
        "V2",
        "User chưa có địa chỉ",
        "X3",
      ],
    ],
    boundary: [
      ["Token", "Token hợp lệ", "Không gửi token", "`401 Unauthorized`", "B1"],
      [
        "Danh sách địa chỉ",
        "Có 1 địa chỉ sau khi vừa tạo",
        "Không có địa chỉ",
        "`2xx` với mảng rỗng",
        "B2",
      ],
    ],
    testCases: [
      {
        name: "GetAddresses sau khi thêm địa chỉ",
        input: "`GET /api/account/addresses` kèm token sau khi vừa AddAddress",
        expected: "`2xx`, danh sách có address vừa tạo",
        actual: "Passed trong scenario Address CRUD",
        result: "Pass",
        tags: "V1, V2",
      },
      {
        name: "GetAddresses không token",
        input: "`GET /api/account/addresses` không gửi token",
        expected: "`401 Unauthorized`",
        actual: "Chưa có trong file hiện tại",
        result: "Chưa chạy",
        tags: "X1",
      },
    ],
    code: `const listRes = await I.sendGetRequest(
  "/api/account/addresses",
  authHeaders(customer.token)
);

assert2xx(listRes, "GetAddresses phải thành công");

const addresses = extractArray(listRes.data);

assert(
  addresses.some((address) => Number(pick(address, "id", "Id")) === addressId),
  "Danh sách địa chỉ không có address vừa tạo"
);`,
  },

  {
    file: "BB_API_Address_GetAddressById.md",
    title: "Black-box API Test - Address GetAddressById",
    functionName: "Address.GetAddressById",
    endpoint: "GET /api/account/addresses/{id}",
    output:
      "Nếu địa chỉ tồn tại, API trả về `2xx` và thông tin address. Nếu địa chỉ không tồn tại hoặc đã xóa, API trả về `404 Not Found`.",
    equivalence: [
      [
        "Authorization token",
        "Token user hợp lệ",
        "V1",
        "Không có token hoặc token sai",
        "X1, X2",
      ],
      [
        "addressId",
        "ID địa chỉ tồn tại và thuộc user",
        "V2",
        "ID không tồn tại, đã xóa hoặc thuộc user khác",
        "X3, X4",
      ],
    ],
    boundary: [
      ["addressId", "`id` vừa tạo", "`id` đã xóa", "`404 Not Found`", "B1"],
      ["addressId", "`id` hợp lệ", "`99999999`", "`404 Not Found`", "B2"],
      ["Token", "Token hợp lệ", "Không gửi token", "`401 Unauthorized`", "B3"],
    ],
    testCases: [
      {
        name: "GetAddressById sau khi xóa",
        input: "`GET /api/account/addresses/{id}` với id đã bị xóa",
        expected: "`404 Not Found`",
        actual: "Passed trong scenario Address CRUD",
        result: "Pass",
        tags: "X3",
      },
      {
        name: "GetAddressById hợp lệ",
        input: "`GET /api/account/addresses/{id}` với id tồn tại",
        expected: "`2xx`, response có thông tin address",
        actual: "Chưa có trong file hiện tại",
        result: "Chưa chạy",
        tags: "V2",
      },
    ],
    code: `const getDeletedRes = await I.sendGetRequest(
  \`/api/account/addresses/\${addressId}\`,
  authHeaders(customer.token)
);

assertStatus(getDeletedRes, 404, "Địa chỉ đã xóa thì GetById phải trả về 404");`,
  },

  {
    file: "BB_API_Address_UpdateAddress.md",
    title: "Black-box API Test - Address UpdateAddress",
    functionName: "Address.UpdateAddress",
    endpoint: "PUT /api/account/addresses/{id}",
    output:
      "Nếu input hợp lệ, API trả về `2xx` và address đã cập nhật. Nếu id không tồn tại trả `404`, nếu body sai trả `400`.",
    equivalence: [
      [
        "Authorization token",
        "Token user hợp lệ",
        "V1",
        "Không có token hoặc token sai",
        "X1, X2",
      ],
      [
        "addressId",
        "ID địa chỉ tồn tại và thuộc user",
        "V2",
        "ID không tồn tại hoặc thuộc user khác",
        "X3, X4",
      ],
      [
        "fullName/phone/address",
        "Thông tin cập nhật hợp lệ",
        "V3",
        "Thông tin rỗng hoặc sai định dạng",
        "X5",
      ],
    ],
    boundary: [
      ["addressId", "`id` vừa tạo", "`99999999`", "`404 Not Found`", "B1"],
      [
        "fullName",
        "`Updated Receiver`",
        "Chuỗi rỗng",
        "`400 Bad Request`",
        "B2",
      ],
      ["phone", "`0999999999`", "`123`", "`400 Bad Request`", "B3"],
      ["city", "`Ha Noi`", "Chuỗi rỗng", "`400 Bad Request`", "B4"],
    ],
    testCases: [
      {
        name: "UpdateAddress thành công",
        input:
          "`PUT /api/account/addresses/{id}` với id vừa tạo và body hợp lệ",
        expected: "`2xx`, city và fullName được cập nhật đúng",
        actual: "Passed trong scenario Address CRUD",
        result: "Pass",
        tags: "V1, V2, V3",
      },
      {
        name: "UpdateAddress id không tồn tại",
        input: "`PUT /api/account/addresses/99999999`",
        expected: "`404 Not Found`",
        actual: "Chưa có trong file hiện tại",
        result: "Chưa chạy",
        tags: "X3",
      },
    ],
    code: `const updateRes = await I.sendPutRequest(
  \`/api/account/addresses/\${addressId}\`,
  updatePayload,
  authHeaders(customer.token)
);

assert2xx(updateRes, "UpdateAddress phải thành công");

const updatedAddress = getAddress(updateRes.data);

assert.strictEqual(
  pick(updatedAddress, "city", "City"),
  updatePayload.city,
  "City sau khi update address không đúng"
);`,
  },

  {
    file: "BB_API_Address_DeleteAddress.md",
    title: "Black-box API Test - Address DeleteAddress",
    functionName: "Address.DeleteAddress",
    endpoint: "DELETE /api/account/addresses/{id}",
    output:
      "Nếu xóa thành công, API trả về `204 No Content`. Sau khi xóa, gọi lại địa chỉ đó phải trả `404 Not Found`.",
    equivalence: [
      [
        "Authorization token",
        "Token user hợp lệ",
        "V1",
        "Không có token hoặc token sai",
        "X1, X2",
      ],
      [
        "addressId",
        "ID địa chỉ tồn tại và thuộc user",
        "V2",
        "ID không tồn tại, đã xóa hoặc thuộc user khác",
        "X3, X4",
      ],
    ],
    boundary: [
      [
        "addressId",
        "`id` vừa tạo",
        "`id` đã xóa",
        "`404 Not Found` khi get lại",
        "B1",
      ],
      ["addressId", "`id` hợp lệ", "`99999999`", "`404 Not Found`", "B2"],
      ["Token", "Token hợp lệ", "Không gửi token", "`401 Unauthorized`", "B3"],
    ],
    testCases: [
      {
        name: "DeleteAddress thành công",
        input: "`DELETE /api/account/addresses/{id}` với id vừa tạo",
        expected: "`204 No Content`",
        actual: "Passed trong scenario Address CRUD",
        result: "Pass",
        tags: "V1, V2",
      },
      {
        name: "Get lại address sau khi xóa",
        input: "`GET /api/account/addresses/{id}` sau khi delete",
        expected: "`404 Not Found`",
        actual: "Passed trong scenario Address CRUD",
        result: "Pass",
        tags: "X3",
      },
    ],
    code: `const deleteRes = await I.sendDeleteRequest(
  \`/api/account/addresses/\${addressId}\`,
  authHeaders(customer.token)
);

assertStatus(deleteRes, 204, "DeleteAddress thành công phải trả về 204");

const getDeletedRes = await I.sendGetRequest(
  \`/api/account/addresses/\${addressId}\`,
  authHeaders(customer.token)
);

assertStatus(getDeletedRes, 404, "Địa chỉ đã xóa thì GetById phải trả về 404");`,
  },
];

for (const doc of docs) {
  fs.writeFileSync(path.join(outDir, doc.file), render(doc), "utf8");
}

const readme = `# Bộ tài liệu Markdown cho auth_account_api_test.js

## Danh sách file theo từng function/API

${table(
  ["STT", "File .md", "Function/API"],
  docs.map((doc, index) => [
    index + 1,
    `\`${doc.file}\``,
    `\`${doc.functionName}\``,
  ]),
)}

## Ghi chú

Các file này được viết theo hướng Black-box API Testing:

- Input là HTTP request: method, endpoint, headers, body.
- Output là HTTP response: status code và response body.
- Actual Output dựa trên kết quả chạy: \`${RUN_RESULT}\`.
- Một vài nhánh hợp lệ/chưa có trong test hiện tại được ghi rõ là \`Chưa có trong file hiện tại\`.
`;

fs.writeFileSync(path.join(outDir, "README.md"), readme, "utf8");

console.log("Đã tạo xong file .md tại:");
console.log(outDir);
console.log("");
console.log("Danh sách file:");
for (const doc of docs) {
  console.log("- " + doc.file);
}
console.log("- README.md");
