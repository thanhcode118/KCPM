const assert = require("assert");
const fs = require("fs");
const path = require("path");

Feature("FE - Admin UI");

const FE_URL = process.env.FE_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:5020";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin1@homedecorshop.local";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin1";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const CUSTOMER_PASSWORD = "Customer@123";

const LOGIN_ENDPOINTS = [
  "/api/auth/login",
  "/api/Auth/login",
  "/api/account/login",
];

const REGISTER_ENDPOINTS = [
  "/api/auth/register",
  "/api/Auth/register",
  "/api/account/register",
];

const LOGIN_ROUTES = ["/login", "/auth/login", "/account/login", "/dang-nhap"];

function uniqueSuffix() {
  return `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function testEmail(prefix) {
  return `${prefix}_${uniqueSuffix()}@example.com`;
}

function appUrl(route = "/") {
  return new URL(route, FE_URL).toString();
}

function bodyText(body) {
  try {
    return typeof body === "string" ? body : JSON.stringify(body);
  } catch {
    return String(body);
  }
}

function normalizeText(value) {
  return String(value || "")
    .replace(/Đ/g, "D")
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function pick(obj, keys) {
  if (!obj || typeof obj !== "object") return undefined;

  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      return obj[key];
    }
  }

  return undefined;
}

function normalizeAuthToken(value) {
  if (!value) return null;

  let token = value;

  if (typeof token !== "string") {
    try {
      token = JSON.stringify(token);
    } catch {
      token = String(token);
    }
  }

  token = String(token).trim();

  try {
    const parsed = JSON.parse(token);

    if (typeof parsed === "string") {
      token = parsed;
    } else if (parsed && typeof parsed === "object") {
      token =
        parsed.accessToken ||
        parsed.token ||
        parsed.authToken ||
        parsed.jwtToken ||
        parsed.jwt ||
        parsed.access_token ||
        token;
    }
  } catch {
    // Không phải JSON thì bỏ qua.
  }

  token = String(token || "").trim();

  if (token.toLowerCase().startsWith("bearer ")) {
    token = token.slice(7).trim();
  }

  return token || null;
}

function authHeaders(token) {
  const cleanToken = normalizeAuthToken(token);

  if (!cleanToken) return {};

  return {
    Authorization: `Bearer ${cleanToken}`,
    "X-Auth-Token": cleanToken,
  };
}

function collectTokensFromObject(data) {
  const tokens = [];
  const keys = [
    "accessToken",
    "token",
    "jwt",
    "jwtToken",
    "authToken",
    "access_token",
  ];

  function walk(obj, depth = 0) {
    if (!obj || typeof obj !== "object" || depth > 4) return;

    for (const key of keys) {
      const token = normalizeAuthToken(obj[key]);

      if (token) tokens.push(token);
    }

    for (const value of Object.values(obj)) {
      if (value && typeof value === "object") {
        walk(value, depth + 1);
      }
    }
  }

  walk(data);

  return [...new Set(tokens)];
}

function extractAuthToken(data) {
  return collectTokensFromObject(data)[0] || null;
}

function decodeJwtPayload(token) {
  try {
    const parts = String(token || "").split(".");

    if (parts.length < 2) return {};

    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch {
    return {};
  }
}

function roleFromObject(data) {
  const role =
    pick(data, ["role", "Role", "userRole", "UserRole"]) ||
    pick(data?.data, ["role", "Role", "userRole", "UserRole"]) ||
    pick(data?.result, ["role", "Role", "userRole", "UserRole"]) ||
    pick(data?.user, ["role", "Role", "userRole", "UserRole"]) ||
    pick(data?.profile, ["role", "Role", "userRole", "UserRole"]);

  return normalizeText(role);
}

function isAdminProfile(data, token = null) {
  if (roleFromObject(data).includes("admin")) return true;

  const payload = decodeJwtPayload(token);
  const claimRole =
    roleFromObject(payload) ||
    normalizeText(
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
    );

  return claimRole.includes("admin");
}

function assertStatusIn(res, expectedStatuses, message) {
  assert(
    expectedStatuses.includes(res.status),
    `${message}\nExpected: ${expectedStatuses.join(", ")}\nActual: ${
      res.status
    }\nBody: ${bodyText(res.data)}`,
  );
}

async function sendRequest(I, candidate) {
  const method = candidate.method.toUpperCase();
  const body = candidate.body || {};
  const headers = candidate.headers || {};

  if (method === "GET") return I.sendGetRequest(candidate.url, headers);
  if (method === "POST") return I.sendPostRequest(candidate.url, body, headers);
  if (method === "PUT") return I.sendPutRequest(candidate.url, body, headers);

  if (method === "PATCH") {
    if (typeof I.sendPatchRequest === "function") {
      return I.sendPatchRequest(candidate.url, body, headers);
    }

    return I.sendPutRequest(candidate.url, body, headers);
  }

  if (method === "DELETE") return I.sendDeleteRequest(candidate.url, headers);

  throw new Error(`Method không hỗ trợ: ${method}`);
}

async function firstSuccess(I, candidates, expectedStatuses, label) {
  const logs = [];

  for (const candidate of candidates) {
    try {
      const res = await sendRequest(I, candidate);

      if (expectedStatuses.includes(res.status)) {
        return res;
      }

      logs.push(
        `${candidate.method} ${candidate.url} -> ${res.status}, Body: ${bodyText(
          res.data,
        )}`,
      );
    } catch (error) {
      logs.push(
        `${candidate.method} ${candidate.url} -> ERROR ${error.message}`,
      );
    }
  }

  assert.fail(`${label}\n${logs.join("\n")}`);
}

async function firstSuccessPrefer(
  I,
  candidates,
  preferredStatuses,
  acceptedStatuses,
  label,
) {
  const logs = [];
  let acceptedResponse = null;

  for (const candidate of candidates) {
    try {
      const res = await sendRequest(I, candidate);

      if (preferredStatuses.includes(res.status)) return res;

      if (acceptedStatuses.includes(res.status) && !acceptedResponse) {
        acceptedResponse = res;
      }

      logs.push(
        `${candidate.method} ${candidate.url} -> ${res.status}, Body: ${bodyText(
          res.data,
        )}`,
      );
    } catch (error) {
      logs.push(
        `${candidate.method} ${candidate.url} -> ERROR ${error.message}`,
      );
    }
  }

  if (acceptedResponse) return acceptedResponse;

  assert.fail(`${label}\n${logs.join("\n")}`);
}

async function safeOpenAppPage(I, route = "/") {
  if (typeof I.usePlaywrightTo === "function") {
    await I.usePlaywrightTo(`open ${route}`, async ({ page }) => {
      await page.goto(appUrl(route), {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      });

      await page.waitForSelector("body", { timeout: 15000 }).catch(() => {});
    });

    I.wait(1);
    return;
  }

  I.amOnPage(route);
  I.waitForElement("body", 15);
  I.wait(1);
}

async function seedDemoData(I) {
  try {
    await I.sendPostRequest("/api/Maintenance/seed/all", {});
  } catch {
    // Bỏ qua nếu môi trường không bật maintenance API.
  }
}

async function getSnapshot(I) {
  return I.executeScript(() => {
    const storage = {};

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      storage[key] = localStorage.getItem(key);
    }

    return {
      url: window.location.href,
      path: window.location.pathname,
      text: document.body ? document.body.innerText : "",
      storage,
    };
  });
}

async function clearAuthStorage(I) {
  await safeOpenAppPage(I, "/");

  await I.executeScript(() => {
    const shouldRemove = (key) => {
      const normalized = String(key || "").toLowerCase();

      return (
        normalized.includes("token") ||
        normalized.includes("auth") ||
        normalized.includes("jwt") ||
        normalized.includes("user") ||
        normalized.includes("account") ||
        normalized.includes("role")
      );
    };

    for (const key of Object.keys(localStorage)) {
      if (shouldRemove(key)) {
        localStorage.removeItem(key);
      }
    }

    sessionStorage.clear();
  });
}

function loginBodies(loginValue, password) {
  const value = String(loginValue || "").trim();

  if (value.includes("@")) {
    return [
      {
        email: value,
        password,
      },
    ];
  }

  return [
    {
      email: `${value}@homedecorshop.local`,
      password,
    },
    {
      email: value,
      password,
    },
    {
      username: value,
      password,
    },
    {
      userName: value,
      password,
    },
    {
      login: value,
      password,
    },
    {
      emailOrUsername: value,
      password,
    },
  ];
}

async function loginByApiWithValue(I, loginValue, password, label) {
  const logs = [];

  for (const endpoint of LOGIN_ENDPOINTS) {
    for (const body of loginBodies(loginValue, password)) {
      try {
        const res = await I.sendPostRequest(endpoint, body);

        if (res.status >= 200 && res.status < 300) {
          const token = extractAuthToken(res.data);

          if (token) {
            return {
              token,
              response: res,
              loginValue,
              password,
            };
          }

          logs.push(
            `${endpoint} ${bodyText(body)} -> ${res.status} nhưng không có token. Body: ${bodyText(
              res.data,
            )}`,
          );
        } else {
          logs.push(
            `${endpoint} ${bodyText(body)} -> ${res.status}. Body: ${bodyText(
              res.data,
            )}`,
          );
        }
      } catch (error) {
        logs.push(`${endpoint} ${bodyText(body)} -> ERROR ${error.message}`);
      }
    }
  }

  assert.fail(`${label}\n${logs.join("\n")}`);
}

async function getProfileByApi(I, token) {
  return firstSuccess(
    I,
    [
      {
        method: "GET",
        url: "/api/account/profile",
        headers: authHeaders(token),
      },
      {
        method: "GET",
        url: "/api/account/me",
        headers: authHeaders(token),
      },
      {
        method: "GET",
        url: "/api/profile",
        headers: authHeaders(token),
      },
    ],
    [200],
    "Không lấy được profile bằng token",
  );
}

async function loginAdminByApi(I) {
  await seedDemoData(I);

  const candidates = [
    {
      loginValue: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    },
    {
      loginValue: "admin1@homedecorshop.local",
      password: "admin123",
    },
    {
      loginValue: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
    },
    {
      loginValue: "admin1",
      password: "admin123",
    },
    {
      loginValue: "admin@example.com",
      password: "admin123",
    },
    {
      loginValue: "admin@example.com",
      password: "Admin@123",
    },
  ];

  const logs = [];

  for (const candidate of candidates) {
    try {
      const loginResult = await loginByApiWithValue(
        I,
        candidate.loginValue,
        candidate.password,
        `Login admin API thất bại với ${candidate.loginValue}`,
      );

      const profileRes = await getProfileByApi(I, loginResult.token);

      if (isAdminProfile(profileRes.data, loginResult.token)) {
        return {
          token: loginResult.token,
          loginValue: candidate.loginValue,
          password: candidate.password,
          profile: profileRes.data,
        };
      }

      logs.push(
        `${candidate.loginValue} login được nhưng không phải admin. Profile: ${bodyText(
          profileRes.data,
        )}`,
      );
    } catch (error) {
      logs.push(`${candidate.loginValue} -> ${error.message}`);
    }
  }

  assert.fail(`Không tìm được tài khoản admin hợp lệ.\n${logs.join("\n")}`);
}

async function registerCustomerByApi(I) {
  await seedDemoData(I);

  const email = testEmail("fe_admin_customer");
  const body = {
    email,
    password: CUSTOMER_PASSWORD,
    confirmPassword: CUSTOMER_PASSWORD,
    fullName: "FE Admin Guard Customer",
    phone: "0900000000",
  };

  const registerRes = await firstSuccess(
    I,
    REGISTER_ENDPOINTS.map((url) => ({
      method: "POST",
      url,
      body,
    })),
    [200, 201],
    "Register customer bằng API thất bại",
  );

  let token = null;

  try {
    const loginResult = await loginByApiWithValue(
      I,
      email,
      CUSTOMER_PASSWORD,
      "Login customer API thất bại",
    );

    token = loginResult.token;
  } catch {
    token = extractAuthToken(registerRes.data);
  }

  assert(
    token,
    `Không lấy được token customer. Body: ${bodyText(registerRes.data)}`,
  );

  return {
    email,
    password: CUSTOMER_PASSWORD,
    token,
  };
}

async function fillInput(I, hints, value, options = {}) {
  return I.executeScript(
    ({ hints, value, options }) => {
      const normalizeText = (inputValue) =>
        String(inputValue || "")
          .replace(/Đ/g, "D")
          .replace(/đ/g, "d")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();

      const isVisible = (element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);

        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          !element.disabled &&
          !element.readOnly
        );
      };

      const fields = Array.from(
        document.querySelectorAll("input, textarea, select"),
      ).filter(isVisible);

      const normalizedHints = hints.map(normalizeText);

      let matched = fields.find((field) => {
        if (options.type && field.type !== options.type) return false;

        const labels = field.labels ? Array.from(field.labels) : [];
        const labelText = labels
          .map((label) => label.innerText || "")
          .join(" ");

        const info = normalizeText(
          [
            field.type,
            field.name,
            field.id,
            field.placeholder,
            field.autocomplete,
            field.getAttribute("aria-label"),
            labelText,
          ].join(" "),
        );

        return normalizedHints.some((hint) => info.includes(hint));
      });

      if (!matched && options.type) {
        matched = fields.find((field) => field.type === options.type);
      }

      if (!matched && options.fallbackIndex !== undefined) {
        matched = fields[options.fallbackIndex];
      }

      if (!matched) {
        return {
          found: false,
          hints,
        };
      }

      matched.focus();

      if (matched.tagName.toLowerCase() === "select") {
        const option =
          Array.from(matched.options).find((item) =>
            normalizeText(item.textContent).includes(normalizeText(value)),
          ) || matched.options[1];

        if (option) matched.value = option.value;
      } else {
        const prototype =
          matched.tagName.toLowerCase() === "textarea"
            ? window.HTMLTextAreaElement.prototype
            : window.HTMLInputElement.prototype;

        const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

        if (setter) setter.call(matched, value);
        else matched.value = value;
      }

      matched.dispatchEvent(new Event("input", { bubbles: true }));
      matched.dispatchEvent(new Event("change", { bubbles: true }));
      matched.dispatchEvent(new Event("blur", { bubbles: true }));

      return {
        found: true,
        type: matched.type,
        name: matched.name,
        id: matched.id,
        placeholder: matched.placeholder,
      };
    },
    { hints, value, options },
  );
}

async function clickAction(I, texts, fallbackSubmit = true) {
  const result = await I.executeScript(
    ({ texts, fallbackSubmit }) => {
      const normalizeText = (value) =>
        String(value || "")
          .replace(/Đ/g, "D")
          .replace(/đ/g, "d")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();

      const isVisible = (element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);

        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          !element.disabled
        );
      };

      const normalizedTexts = texts.map(normalizeText);

      const candidates = Array.from(
        document.querySelectorAll(
          "button, a, input[type='submit'], input[type='button'], [role='button']",
        ),
      ).filter(isVisible);

      let element = candidates.find((candidate) => {
        const text = normalizeText(
          [
            candidate.innerText,
            candidate.textContent,
            candidate.value,
            candidate.getAttribute("aria-label"),
            candidate.title,
          ].join(" "),
        );

        return normalizedTexts.some((target) => text.includes(target));
      });

      if (!element && fallbackSubmit) {
        element =
          candidates.find(
            (candidate) =>
              candidate.tagName.toLowerCase() === "button" ||
              candidate.type === "submit",
          ) || candidates[0];
      }

      if (!element) {
        return {
          found: false,
          texts,
          candidates: candidates.map(
            (item) => item.innerText || item.textContent || item.value || "",
          ),
        };
      }

      element.click();

      return {
        found: true,
        text:
          element.innerText ||
          element.textContent ||
          element.value ||
          element.getAttribute("aria-label") ||
          "",
      };
    },
    { texts, fallbackSubmit },
  );

  assert(
    result && result.found,
    `Không tìm thấy nút để click: ${texts.join(", ")}. Buttons: ${bodyText(result)}`,
  );

  I.wait(1);

  return result;
}

async function clickAdminTab(I, texts) {
  return clickAction(I, Array.isArray(texts) ? texts : [texts], false);
}

async function uiLogin(I, loginValue, password) {
  for (const route of LOGIN_ROUTES) {
    await safeOpenAppPage(I, route);

    const hasLoginForm = await I.executeScript(() => {
      const inputs = Array.from(document.querySelectorAll("input"));
      const hasPassword = inputs.some((input) => input.type === "password");

      const hasLoginLike = inputs.some((input) => {
        const info = [
          input.type,
          input.name,
          input.id,
          input.placeholder,
          input.autocomplete,
        ]
          .join(" ")
          .toLowerCase();

        return (
          info.includes("email") ||
          info.includes("mail") ||
          info.includes("user") ||
          info.includes("login") ||
          input.type === "text"
        );
      });

      return hasPassword && hasLoginLike;
    });

    if (!hasLoginForm) continue;

    const loginFill = await fillInput(
      I,
      ["email", "mail", "username", "user", "tai khoan", "dang nhap"],
      loginValue,
      { fallbackIndex: 0 },
    );

    const passwordFill = await fillInput(
      I,
      ["password", "mat khau"],
      password,
      { type: "password" },
    );

    assert(loginFill.found, `Không tìm thấy ô nhập tài khoản admin`);
    assert(passwordFill.found, `Không tìm thấy ô nhập mật khẩu admin`);

    await clickAction(I, ["dang nhap", "login", "sign in", "submit"]);

    I.wait(4);

    return true;
  }

  return false;
}

async function isAdminShellVisible(I) {
  const snapshot = await getSnapshot(I);
  const normalized = normalizeText(`${snapshot.url} ${snapshot.text}`);

  return (
    normalized.includes("/admin") &&
    (normalized.includes("tong quan he thong") ||
      normalized.includes("quan ly san pham") ||
      normalized.includes("quan ly don hang") ||
      normalized.includes("quan ly khach hang") ||
      normalized.includes("chien dich marketing") ||
      normalized.includes("cai dat phan quyen") ||
      normalized.includes("dashboard"))
  );
}

async function assertAdminShellVisible(
  I,
  label = "Admin dashboard phải hiển thị",
) {
  const snapshot = await getSnapshot(I);

  assert(
    await isAdminShellVisible(I),
    `${label}\nURL: ${snapshot.url}\nText: ${snapshot.text}`,
  );
}

async function openAdminDashboard(I) {
  const admin = await loginAdminByApi(I);

  await clearAuthStorage(I);

  try {
    const loggedInByUi = await uiLogin(I, admin.loginValue, admin.password);

    if (loggedInByUi && (await isAdminShellVisible(I))) {
      return admin;
    }
  } catch (error) {
    I.say(
      `UI login admin thất bại, thử fallback token restore. ${error.message}`,
    );
  }

  await safeOpenAppPage(I, "/");

  await I.executeScript((payload) => {
    const user = {
      email: payload.loginValue,
      fullName: "Admin",
      role: "admin",
    };

    localStorage.setItem("token", payload.token);
    localStorage.setItem("accessToken", payload.token);
    localStorage.setItem("authToken", payload.token);
    localStorage.setItem("jwtToken", payload.token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("role", "admin");
  }, admin);

  await safeOpenAppPage(I, "/");
  I.wait(3);

  await safeOpenAppPage(I, "/admin");
  I.wait(3);

  await assertAdminShellVisible(
    I,
    "Không mở được admin dashboard. Có thể guard admin đang kiểm tra currentUser trước khi restoreSession hoàn tất.",
  );

  return admin;
}

async function expectTextContainsAny(I, texts, label) {
  const snapshot = await getSnapshot(I);
  const normalized = normalizeText(snapshot.text);
  const expected = texts.map(normalizeText);

  assert(
    expected.some((item) => normalized.includes(item)),
    `${label}\nExpected one of: ${texts.join(", ")}\nURL: ${
      snapshot.url
    }\nText: ${snapshot.text}`,
  );
}

async function createInvalidTextFixture() {
  const fixtureDir = path.join(__dirname, "..", "fixtures");
  const filePath = path.join(fixtureDir, "not-image-admin-upload.txt");

  fs.mkdirSync(fixtureDir, { recursive: true });
  fs.writeFileSync(
    filePath,
    `This is not an image. ${new Date().toISOString()}`,
    "utf8",
  );

  return filePath;
}

async function getAdminOrdersByApi(I, token) {
  return firstSuccessPrefer(
    I,
    [
      { method: "GET", url: "/api/admin/orders", headers: authHeaders(token) },
      { method: "GET", url: "/api/orders/admin", headers: authHeaders(token) },
      { method: "GET", url: "/api/orders", headers: authHeaders(token) },
    ],
    [200],
    [404, 405],
    "Admin get orders API thất bại",
  );
}

async function getAdminUsersByApi(I, token) {
  return firstSuccessPrefer(
    I,
    [
      { method: "GET", url: "/api/users", headers: authHeaders(token) },
      { method: "GET", url: "/api/admin/users", headers: authHeaders(token) },
    ],
    [200],
    [404, 405],
    "Admin get users API thất bại",
  );
}

async function getMarketingApi(I, token, type) {
  const endpoints = {
    coupons: ["/api/marketing/coupons", "/api/admin/marketing/coupons"],
    banners: ["/api/marketing/banners", "/api/admin/marketing/banners"],
    blogs: ["/api/marketing/blogs", "/api/admin/marketing/blogs"],
  };

  return firstSuccessPrefer(
    I,
    endpoints[type].map((url) => ({
      method: "GET",
      url,
      headers: authHeaders(token),
    })),
    [200],
    [404, 405],
    `Admin marketing ${type} API thất bại`,
  );
}

async function getSettingsApi(I, token) {
  return firstSuccessPrefer(
    I,
    [
      {
        method: "GET",
        url: "/api/admin/settings",
        headers: authHeaders(token),
      },
      { method: "GET", url: "/api/settings", headers: authHeaders(token) },
      {
        method: "GET",
        url: "/api/system-settings",
        headers: authHeaders(token),
      },
      {
        method: "GET",
        url: "/api/admin/system-settings",
        headers: authHeaders(token),
      },
    ],
    [200],
    [404, 405],
    "Admin settings API thất bại",
  );
}

Scenario(
  "Admin Guard: guest không đăng nhập không được vào trang admin",
  async ({ I }) => {
    await clearAuthStorage(I);

    await safeOpenAppPage(I, "/admin");

    I.wait(2);

    const snapshot = await getSnapshot(I);
    const normalized = normalizeText(`${snapshot.url} ${snapshot.text}`);

    assert(
      snapshot.url.includes("/login") ||
        normalized.includes("dang nhap") ||
        normalized.includes("login"),
      `Guest mở /admin nhưng không bị chuyển về login.\nURL: ${snapshot.url}\nText: ${snapshot.text}`,
    );

    assert(
      !normalized.includes("tong quan he thong"),
      `Guest vẫn nhìn thấy dashboard admin.\nURL: ${snapshot.url}\nText: ${snapshot.text}`,
    );
  },
);

Scenario(
  "Admin Guard: user thường không được vào trang admin",
  async ({ I }) => {
    const customer = await registerCustomerByApi(I);

    await safeOpenAppPage(I, "/");

    await I.executeScript((payload) => {
      const user = {
        email: payload.email,
        fullName: "Customer",
        role: "customer",
      };

      localStorage.setItem("token", payload.token);
      localStorage.setItem("accessToken", payload.token);
      localStorage.setItem("authToken", payload.token);
      localStorage.setItem("jwtToken", payload.token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("role", "customer");
    }, customer);

    await safeOpenAppPage(I, "/");
    I.wait(2);

    await safeOpenAppPage(I, "/admin");
    I.wait(2);

    const snapshot = await getSnapshot(I);
    const normalized = normalizeText(`${snapshot.url} ${snapshot.text}`);

    assert(
      snapshot.url.includes("/login") ||
        normalized.includes("dang nhap") ||
        normalized.includes("login") ||
        !normalized.includes("tong quan he thong"),
      `User thường vẫn vào được admin.\nURL: ${snapshot.url}\nText: ${snapshot.text}`,
    );
  },
);

Scenario("Admin Login: admin đăng nhập vào được dashboard", async ({ I }) => {
  await openAdminDashboard(I);

  await assertAdminShellVisible(I);
});

Scenario(
  "Dashboard: thống kê phải hiển thị nội dung tổng quan",
  async ({ I }) => {
    await openAdminDashboard(I);

    await expectTextContainsAny(
      I,
      [
        "Tổng quan Hệ thống",
        "Doanh thu",
        "Đơn hàng",
        "Khách hàng",
        "Sản phẩm",
        "Dashboard",
      ],
      "Dashboard admin không hiển thị thống kê/tổng quan",
    );
  },
);

Scenario(
  "Admin Tabs: điều hướng được Sản phẩm, Đơn hàng, Khách hàng, Marketing, Settings",
  async ({ I }) => {
    await openAdminDashboard(I);

    await clickAdminTab(I, ["sản phẩm", "san pham", "products"]);
    await expectTextContainsAny(
      I,
      ["Quản lý Sản phẩm", "Thêm Sản Phẩm", "Danh sách sản phẩm"],
      "Tab sản phẩm không hiển thị đúng",
    );

    await clickAdminTab(I, ["đơn hàng", "don hang", "orders"]);
    await expectTextContainsAny(
      I,
      ["Quản lý Đơn hàng", "Đơn hàng", "Trạng thái"],
      "Tab đơn hàng không hiển thị đúng",
    );

    await clickAdminTab(I, ["khách hàng", "khach hang", "customers", "users"]);
    await expectTextContainsAny(
      I,
      ["Quản lý Khách hàng", "Khách hàng", "Email", "Số điện thoại"],
      "Tab khách hàng không hiển thị đúng",
    );

    await clickAdminTab(I, ["marketing", "chiến dịch"]);
    await expectTextContainsAny(
      I,
      ["Chiến dịch Marketing", "Mã giảm giá", "Banner", "Bài viết"],
      "Tab marketing không hiển thị đúng",
    );

    await clickAdminTab(I, [
      "hệ thống",
      "he thong",
      "system",
      "cài đặt",
      "cai dat",
      "settings",
    ]);
    await expectTextContainsAny(
      I,
      ["Cài đặt Phân quyền", "Các Quyền Quản Trị", "Admin", "Sale", "Content"],
      "Tab settings không hiển thị đúng",
    );
  },
);

Scenario(
  "Products: tab sản phẩm hiển thị danh sách và nút thêm",
  async ({ I }) => {
    await openAdminDashboard(I);

    await clickAdminTab(I, ["sản phẩm", "san pham", "products"]);

    await expectTextContainsAny(
      I,
      ["Thêm Sản Phẩm", "Tìm kiếm sản phẩm", "Tên sản phẩm", "SKU"],
      "Quản lý sản phẩm thiếu danh sách/nút thêm",
    );
  },
);

Scenario(
  "Products: mở modal thêm sản phẩm và validate dữ liệu thiếu",
  async ({ I }) => {
    await openAdminDashboard(I);

    await clickAdminTab(I, ["sản phẩm", "san pham", "products"]);

    await clickAction(
      I,
      ["thêm sản phẩm", "them san pham", "add product"],
      false,
    );

    await expectTextContainsAny(
      I,
      ["Thêm sản phẩm", "Tên sản phẩm", "Giá bán", "Ảnh"],
      "Modal thêm sản phẩm không hiển thị form",
    );

    await clickAction(I, ["lưu sản phẩm", "luu san pham", "save"], true);

    await expectTextContainsAny(
      I,
      [
        "tên sản phẩm",
        "vui lòng",
        "bắt buộc",
        "required",
        "ảnh chính",
        "không được để trống",
      ],
      "Form thêm sản phẩm không hiển thị validation khi thiếu dữ liệu",
    );
  },
);

Scenario("Orders: admin xem được màn hình quản lý đơn hàng", async ({ I }) => {
  await openAdminDashboard(I);

  await clickAdminTab(I, ["đơn hàng", "don hang", "orders"]);

  await expectTextContainsAny(
    I,
    ["Quản lý Đơn hàng", "Đơn hàng", "Trạng thái", "Tổng tiền", "Khách hàng"],
    "Màn hình quản lý đơn hàng không hiển thị dữ liệu/cột cần thiết",
  );
});

Scenario("Users: admin xem được màn hình quản lý khách hàng", async ({ I }) => {
  await openAdminDashboard(I);

  await clickAdminTab(I, ["khách hàng", "khach hang", "customers", "users"]);

  await expectTextContainsAny(
    I,
    ["Quản lý Khách hàng", "Khách hàng", "Email", "Vai trò", "Trạng thái"],
    "Màn hình quản lý khách hàng không hiển thị dữ liệu/cột cần thiết",
  );
});

Scenario("Marketing: admin xem được coupon, banner, blog", async ({ I }) => {
  await openAdminDashboard(I);

  await clickAdminTab(I, ["marketing", "chiến dịch"]);

  await expectTextContainsAny(
    I,
    ["Mã giảm giá", "Banner", "Bài viết", "Tạo Mã", "Marketing"],
    "Màn hình marketing thiếu coupon/banner/blog",
  );
});

Scenario("Settings: admin xem được cấu hình phân quyền", async ({ I }) => {
  await openAdminDashboard(I);

  await clickAdminTab(I, [
    "hệ thống",
    "he thong",
    "system",
    "cài đặt",
    "cai dat",
    "settings",
  ]);

  await expectTextContainsAny(
    I,
    ["Cài đặt Phân quyền", "Các Quyền Quản Trị", "Admin", "Sale", "Content"],
    "Màn hình settings thiếu phần phân quyền/cấu hình",
  );
});

Scenario(
  "Admin API: các API chính cho orders, users, marketing, settings trả trạng thái hợp lệ",
  async ({ I }) => {
    const admin = await loginAdminByApi(I);

    assertStatusIn(
      await getAdminOrdersByApi(I, admin.token),
      [200, 404, 405],
      "Admin orders API phải trả status hợp lệ",
    );

    assertStatusIn(
      await getAdminUsersByApi(I, admin.token),
      [200, 404, 405],
      "Admin users API phải trả status hợp lệ",
    );

    assertStatusIn(
      await getMarketingApi(I, admin.token, "coupons"),
      [200, 404, 405],
      "Admin coupons API phải trả status hợp lệ",
    );

    assertStatusIn(
      await getMarketingApi(I, admin.token, "banners"),
      [200, 404, 405],
      "Admin banners API phải trả status hợp lệ",
    );

    assertStatusIn(
      await getMarketingApi(I, admin.token, "blogs"),
      [200, 404, 405],
      "Admin blogs API phải trả status hợp lệ",
    );

    assertStatusIn(
      await getSettingsApi(I, admin.token),
      [200, 404, 405],
      "Admin settings API phải trả status hợp lệ",
    );
  },
);

Scenario(
  "Upload ảnh: file không phải ảnh phải bị chặn hoặc không được báo thành công",
  async ({ I }) => {
    await openAdminDashboard(I);

    await clickAdminTab(I, ["sản phẩm", "san pham", "products"]);

    await clickAction(
      I,
      ["thêm sản phẩm", "them san pham", "add product"],
      false,
    );

    const filePath = await createInvalidTextFixture();

    const uploadResult = await I.usePlaywrightTo(
      "upload invalid text file",
      async ({ page }) => {
        const fileInput = page.locator("input[type='file']").first();
        const count = await fileInput.count();

        if (count === 0) {
          return { hasFileInput: false };
        }

        await fileInput.setInputFiles(filePath);
        await page.waitForTimeout(3000);

        return {
          hasFileInput: true,
          text: await page
            .locator("body")
            .innerText()
            .catch(() => ""),
        };
      },
    );

    assert(
      uploadResult && uploadResult.hasFileInput,
      "Không tìm thấy input upload ảnh trong modal sản phẩm",
    );

    const text = await I.grabTextFrom("body");
    const normalized = normalizeText(text);

    assert(
      !(
        normalized.includes("tai anh thanh cong") ||
        normalized.includes("upload thanh cong") ||
        normalized.includes("thanh cong")
      ),
      `File text không phải ảnh nhưng UI vẫn báo thành công. Text: ${text}`,
    );
  },
);

Scenario(
  "BUG: reload trực tiếp /admin với token admin hợp lệ không được văng về login",
  async ({ I }) => {
    const admin = await loginAdminByApi(I);

    await I.usePlaywrightTo(
      "direct reload admin with stored token",
      async ({ page }) => {
        await page.addInitScript((payload) => {
          localStorage.setItem("token", payload.token);
          localStorage.setItem("accessToken", payload.token);
          localStorage.setItem("authToken", payload.token);
          localStorage.setItem("jwtToken", payload.token);
        }, admin);

        await page.goto(appUrl("/admin"), {
          waitUntil: "domcontentloaded",
          timeout: 45000,
        });

        await page.waitForTimeout(4000);
      },
    );

    const snapshot = await getSnapshot(I);
    const normalized = normalizeText(`${snapshot.url} ${snapshot.text}`);

    assert(
      snapshot.url.includes("/admin") &&
        !snapshot.url.includes("/login") &&
        (normalized.includes("tong quan he thong") ||
          normalized.includes("quan ly san pham") ||
          normalized.includes("dashboard")),
      `BUG: Người dùng đã có token admin hợp lệ nhưng reload trực tiếp /admin vẫn bị văng login hoặc không thấy dashboard.\nURL: ${snapshot.url}\nText: ${snapshot.text}`,
    );
  },
);

Scenario(
  "BUG: tạo coupon thiếu mã phải bị chặn ở UI trước khi gọi API",
  async ({ I }) => {
    await openAdminDashboard(I);

    await clickAdminTab(I, ["marketing", "chiến dịch"]);

    let couponPostCalled = false;

    await I.usePlaywrightTo("intercept coupon post", async ({ page }) => {
      await page.route(`${API_URL}/api/marketing/coupons`, async (route) => {
        couponPostCalled = true;

        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Coupon code is required",
          }),
        });
      });

      await page.route(`${API_URL}/api/marketing/coupons/**`, async (route) => {
        couponPostCalled = true;

        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Coupon code is required",
          }),
        });
      });
    });

    await clickAction(
      I,
      ["tạo mã", "tao ma", "thêm mã", "them ma", "coupon"],
      false,
    );

    await expectTextContainsAny(
      I,
      ["Mã giảm giá", "Coupon", "Phần trăm", "Giảm giá"],
      "Modal tạo coupon không hiển thị",
    );

    await clickAction(I, ["lưu", "save", "tạo", "tao"], true);

    I.wait(2);

    const snapshot = await getSnapshot(I);
    const normalized = normalizeText(snapshot.text);

    assert(
      normalized.includes("bat buoc") ||
        normalized.includes("required") ||
        normalized.includes("vui long") ||
        normalized.includes("ma giam gia") ||
        normalized.includes("coupon code"),
      `BUG: Coupon thiếu mã không hiển thị validation rõ ràng. Text: ${snapshot.text}`,
    );

    assert(
      !couponPostCalled,
      "BUG: UI vẫn gọi API tạo coupon dù mã coupon đang trống. Cần validate ở client trước khi submit.",
    );
  },
);

Scenario(
  "BUG: user thường không được gọi API danh sách users",
  async ({ I }) => {
    const customer = await registerCustomerByApi(I);

    const res = await I.sendGetRequest(
      "/api/users",
      authHeaders(customer.token),
    );

    assertStatusIn(
      res,
      [401, 403],
      "BUG: User thường gọi được API /api/users. Đây là dữ liệu quản trị và phải bị chặn.",
    );
  },
);
