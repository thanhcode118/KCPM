const assert = require("assert");

Feature("BE - Auth / Account / Address API");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin1@homedecorshop.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

function uniqueSuffix() {
  return `${Date.now()}${Math.floor(Math.random() * 100000)}`;
}

function assert2xx(res, message) {
  assert(
    res.status >= 200 && res.status < 300,
    `${message}. Status hiện tại: ${res.status}. Response: ${JSON.stringify(res.data)}`,
  );
}

function assertStatus(res, expectedStatuses, message) {
  const statuses = Array.isArray(expectedStatuses)
    ? expectedStatuses
    : [expectedStatuses];

  assert(
    statuses.includes(res.status),
    `${message}. Expected: ${statuses.join(" hoặc ")}, actual: ${res.status}. Response: ${JSON.stringify(res.data)}`,
  );
}

function pick(obj, ...keys) {
  if (!obj || typeof obj !== "object") return undefined;

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return obj[key];
    }
  }

  const lowerKeys = keys.map((key) => String(key).toLowerCase());
  const realKey = Object.keys(obj).find((key) =>
    lowerKeys.includes(key.toLowerCase()),
  );

  return realKey ? obj[realKey] : undefined;
}

function getToken(data) {
  const holders = [
    data,
    pick(data, "data"),
    pick(data, "result"),
    pick(data, "auth"),
  ].filter(Boolean);

  for (const holder of holders) {
    const token = pick(holder, "token", "Token", "accessToken", "authToken");
    if (token) return token;
  }

  return undefined;
}

function getUser(data) {
  return (
    pick(data, "user", "User") ||
    pick(pick(data, "data"), "user", "User") ||
    pick(pick(data, "result"), "user", "User") ||
    data
  );
}

function getAddress(data) {
  return (
    pick(data, "address", "Address") ||
    pick(pick(data, "data"), "address", "Address") ||
    pick(pick(data, "result"), "address", "Address") ||
    data
  );
}

function extractArray(data) {
  if (Array.isArray(data)) return data;

  const candidates = [
    data,
    pick(data, "data"),
    pick(data, "items"),
    pick(data, "result"),
    pick(data, "addresses"),
    pick(pick(data, "data"), "items"),
    pick(pick(data, "data"), "addresses"),
    pick(pick(data, "result"), "items"),
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

function authHeaders(token) {
  return {
    "X-Auth-Token": token,
    Authorization: `Bearer ${token}`,
  };
}

function buildRegisterPayload() {
  const suffix = uniqueSuffix();

  return {
    email: `codecept.user.${suffix}@example.com`,
    fullName: `Codecept User ${suffix}`,
    phone: "0987654321",
    password: "Password123",
    role: "customer",
  };
}

function buildUpdateProfilePayload() {
  const suffix = uniqueSuffix();

  return {
    fullName: `Updated User ${suffix}`,
    phone: "0912345678",
  };
}

function buildAddressPayload(overrides = {}) {
  const suffix = uniqueSuffix();

  return {
    fullName: `Receiver ${suffix}`,
    phone: "0901234567",
    line1: `123 Test Street ${suffix}`,
    ward: "Ward 1",
    district: "District 1",
    city: "Ho Chi Minh",
    isDefault: true,
    ...overrides,
  };
}

async function seedDemoData(I) {
  const res = await I.sendPostRequest("/api/Maintenance/seed/all");

  assert2xx(
    res,
    "Seed demo data thất bại. Hãy kiểm tra backend và database đã chạy chưa",
  );
}

async function registerNewCustomer(I) {
  const payload = buildRegisterPayload();

  const res = await I.sendPostRequest("/api/auth/register", payload);

  assert2xx(res, "Register customer thất bại");

  const token = getToken(res.data);
  const user = getUser(res.data);

  assert(
    token,
    `Register không trả về token. Response: ${JSON.stringify(res.data)}`,
  );
  assert(
    user,
    `Register không trả về user. Response: ${JSON.stringify(res.data)}`,
  );

  return {
    token,
    email: payload.email,
    password: payload.password,
    user,
  };
}

async function loginAdmin(I) {
  const res = await I.sendPostRequest("/api/auth/login", {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  assert2xx(res, "Login admin thất bại");

  const token = getToken(res.data);
  const user = getUser(res.data);

  assert(
    token,
    `Login không trả về token. Response: ${JSON.stringify(res.data)}`,
  );
  assert(
    user,
    `Login không trả về user. Response: ${JSON.stringify(res.data)}`,
  );

  return {
    token,
    user,
  };
}

BeforeSuite(async ({ I }) => {
  await seedDemoData(I);
});

Scenario(
  "Register customer thành công phải trả về token và user",
  async ({ I }) => {
    const payload = buildRegisterPayload();

    const res = await I.sendPostRequest("/api/auth/register", payload);

    assert2xx(res, "API register phải trả về 2xx");

    const token = getToken(res.data);
    const user = getUser(res.data);

    assert(
      token,
      `Register không trả về token. Response: ${JSON.stringify(res.data)}`,
    );
    assert(
      user,
      `Register không trả về user. Response: ${JSON.stringify(res.data)}`,
    );

    assert.strictEqual(
      pick(user, "email", "Email"),
      payload.email.toLowerCase(),
      "Email user trả về không đúng",
    );

    assert.strictEqual(
      pick(user, "role", "Role"),
      "customer",
      "User mới đăng ký phải có role customer",
    );
  },
);

Scenario("Register thiếu dữ liệu bắt buộc phải trả về 400", async ({ I }) => {
  const res = await I.sendPostRequest("/api/auth/register", {
    email: "invalid-email",
    fullName: "",
    phone: "123",
    password: "123",
    role: "customer",
  });

  assertStatus(res, 400, "Register input không hợp lệ phải trả về 400");
});

Scenario("Login admin seed thành công phải trả về token", async ({ I }) => {
  const { token, user } = await loginAdmin(I);

  assert(token, "Login admin phải trả về token");
  assert.strictEqual(
    pick(user, "email", "Email"),
    ADMIN_EMAIL,
    "Email admin trả về không đúng",
  );
});

Scenario("Login sai mật khẩu phải trả về 401", async ({ I }) => {
  const res = await I.sendPostRequest("/api/auth/login", {
    email: ADMIN_EMAIL,
    password: "WrongPassword123",
  });

  assertStatus(res, 401, "Login sai mật khẩu phải trả về 401");
});

Scenario("ConfirmEmail với token sai phải trả về 400", async ({ I }) => {
  const res = await I.sendGetRequest(
    `/api/auth/confirm-email?token=invalid-token-${uniqueSuffix()}`,
  );

  assertStatus(res, 400, "Confirm email với token sai phải trả về 400");
});

Scenario(
  "GetProfile bằng token hợp lệ phải trả về thông tin user",
  async ({ I }) => {
    const customer = await registerNewCustomer(I);

    const res = await I.sendGetRequest(
      "/api/account/profile",
      authHeaders(customer.token),
    );

    assert2xx(res, "Get profile bằng token hợp lệ phải thành công");

    const profile = getUser(res.data);

    assert.strictEqual(
      pick(profile, "email", "Email"),
      customer.email.toLowerCase(),
      "Profile trả về sai email",
    );
  },
);

Scenario("GetProfile không có token phải trả về 401", async ({ I }) => {
  const res = await I.sendGetRequest("/api/account/profile");

  assertStatus(res, 401, "Get profile không có token phải trả về 401");
});

Scenario(
  "UpdateProfile bằng token hợp lệ phải cập nhật fullName và phone",
  async ({ I }) => {
    const customer = await registerNewCustomer(I);
    const updatePayload = buildUpdateProfilePayload();

    const res = await I.sendPutRequest(
      "/api/account/profile",
      updatePayload,
      authHeaders(customer.token),
    );

    assert2xx(res, "Update profile bằng token hợp lệ phải thành công");

    const updatedProfile = getUser(res.data);

    assert.strictEqual(
      pick(updatedProfile, "fullName", "FullName"),
      updatePayload.fullName,
      "FullName sau khi update không đúng",
    );

    assert.strictEqual(
      pick(updatedProfile, "phone", "Phone"),
      updatePayload.phone,
      "Phone sau khi update không đúng",
    );
  },
);

Scenario(
  "UpdateProfile thiếu dữ liệu bắt buộc phải trả về 400",
  async ({ I }) => {
    const customer = await registerNewCustomer(I);

    const res = await I.sendPutRequest(
      "/api/account/profile",
      {
        fullName: "",
        phone: "123",
      },
      authHeaders(customer.token),
    );

    assertStatus(res, 400, "Update profile input không hợp lệ phải trả về 400");
  },
);

Scenario(
  "Address CRUD: thêm, xem danh sách, cập nhật và xóa địa chỉ",
  async ({ I }) => {
    const customer = await registerNewCustomer(I);

    const createPayload = buildAddressPayload();

    const createRes = await I.sendPostRequest(
      "/api/account/addresses",
      createPayload,
      authHeaders(customer.token),
    );

    assertStatus(createRes, 201, "AddAddress thành công phải trả về 201");

    const createdAddress = getAddress(createRes.data);
    const addressId = Number(pick(createdAddress, "id", "Id"));

    assert(
      addressId > 0,
      `AddAddress không trả về id hợp lệ. Response: ${JSON.stringify(createRes.data)}`,
    );

    assert.strictEqual(
      pick(createdAddress, "city", "City"),
      createPayload.city,
      "City của địa chỉ mới không đúng",
    );

    const listRes = await I.sendGetRequest(
      "/api/account/addresses",
      authHeaders(customer.token),
    );

    assert2xx(listRes, "GetAddresses phải thành công");

    const addresses = extractArray(listRes.data);

    assert(
      addresses.some(
        (address) => Number(pick(address, "id", "Id")) === addressId,
      ),
      `Danh sách địa chỉ không có address vừa tạo. Response: ${JSON.stringify(listRes.data)}`,
    );

    const updatePayload = buildAddressPayload({
      fullName: "Updated Receiver",
      phone: "0999999999",
      line1: "456 Updated Street",
      ward: "Updated Ward",
      district: "Updated District",
      city: "Ha Noi",
      isDefault: false,
    });

    const updateRes = await I.sendPutRequest(
      `/api/account/addresses/${addressId}`,
      updatePayload,
      authHeaders(customer.token),
    );

    assert2xx(updateRes, "UpdateAddress phải thành công");

    const updatedAddress = getAddress(updateRes.data);

    assert.strictEqual(
      pick(updatedAddress, "city", "City"),
      updatePayload.city,
      "City sau khi update address không đúng",
    );

    assert.strictEqual(
      pick(updatedAddress, "fullName", "FullName"),
      updatePayload.fullName,
      "FullName sau khi update address không đúng",
    );

    const deleteRes = await I.sendDeleteRequest(
      `/api/account/addresses/${addressId}`,
      authHeaders(customer.token),
    );

    assertStatus(deleteRes, 204, "DeleteAddress thành công phải trả về 204");

    const getDeletedRes = await I.sendGetRequest(
      `/api/account/addresses/${addressId}`,
      authHeaders(customer.token),
    );

    assertStatus(
      getDeletedRes,
      404,
      "Địa chỉ đã xóa thì GetById phải trả về 404",
    );
  },
);

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
    authHeaders(customer.token),
  );

  assertStatus(res, 400, "AddAddress input không hợp lệ phải trả về 400");
});
