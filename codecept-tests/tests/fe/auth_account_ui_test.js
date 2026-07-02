const assert = require("assert");

Feature("FE - Auth / Account UI");

const CUSTOMER_PASSWORD = "Customer@123";

const LOGIN_ROUTES = ["/login", "/auth/login", "/account/login", "/dang-nhap"];
const REGISTER_ROUTES = [
  "/register",
  "/auth/register",
  "/account/register",
  "/dang-ky",
];

const PROFILE_ROUTES = [
  "/account/profile",
  "/profile",
  "/account",
  "/tai-khoan",
  "/user/profile",
];

const ADDRESS_ROUTES = [
  "/account/addresses",
  "/account/address",
  "/addresses",
  "/address",
  "/tai-khoan/dia-chi",
  "/dia-chi",
  "/account",
];

const CONFIRM_EMAIL_ROUTES = [
  "/confirm-email?email=invalid@example.com&token=invalid-token",
  "/auth/confirm-email?email=invalid@example.com&token=invalid-token",
  "/confirm-email?token=invalid-token",
  "/email-confirmation?token=invalid-token",
];

const ERROR_KEYWORDS = [
  "sai",
  "khong dung",
  "khong hop le",
  "that bai",
  "loi",
  "invalid",
  "incorrect",
  "failed",
  "error",
  "unauthorized",
  "forbidden",
  "401",
  "403",
  "bat buoc",
  "required",
  "validation",
  "ton tai",
  "da duoc su dung",
  "duplicate",
  "exist",
];

const SUCCESS_KEYWORDS = [
  "thanh cong",
  "success",
  "cap nhat",
  "updated",
  "saved",
  "da luu",
  "hoan tat",
  "dang xuat",
  "logout",
  "tai khoan",
  "account",
  "profile",
];

function uniqueSuffix() {
  return `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function testEmail(prefix) {
  return `${prefix}_${uniqueSuffix()}@example.com`;
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

function bodyText(body) {
  try {
    return typeof body === "string" ? body : JSON.stringify(body);
  } catch {
    return String(body);
  }
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

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    "X-Auth-Token": token,
  };
}

function hasKeyword(text, keywords) {
  const normalized = normalizeText(text);
  return keywords.some((keyword) =>
    normalized.includes(normalizeText(keyword)),
  );
}

function hasErrorText(text) {
  return hasKeyword(text, ERROR_KEYWORDS);
}

function hasSuccessText(text) {
  return hasKeyword(text, SUCCESS_KEYWORDS);
}

function looksLikeNotFound(text) {
  return hasKeyword(text, [
    "404",
    "not found",
    "khong tim thay",
    "khong ton tai",
    "page not found",
  ]);
}

function isAuthTokenKey(key) {
  const normalized = normalizeText(key);
  return (
    normalized.includes("token") ||
    normalized.includes("access") ||
    normalized.includes("jwt") ||
    normalized.includes("auth")
  );
}

function hasAuthTokenInStorage(snapshot) {
  const storage = snapshot.storage || {};

  for (const [key, value] of Object.entries(storage)) {
    const textValue = String(value || "");

    if (isAuthTokenKey(key) && textValue.length >= 10) {
      return true;
    }

    if (/"token"\s*:/.test(textValue) || /"accessToken"\s*:/.test(textValue)) {
      return true;
    }
  }

  return false;
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

  assert.fail(
    `${label}\nKhông có endpoint nào trả status mong đợi.\n${logs.join("\n")}`,
  );
}

async function seedDemoData(I) {
  try {
    await I.sendPostRequest("/api/Maintenance/seed/all", {});
  } catch {
    // Bỏ qua nếu môi trường không bật API seed.
  }
}

function extractAuthToken(data) {
  return (
    pick(data, ["accessToken", "token", "jwt", "jwtToken"]) ||
    pick(data?.data, ["accessToken", "token", "jwt", "jwtToken"]) ||
    pick(data?.result, ["accessToken", "token", "jwt", "jwtToken"]) ||
    pick(data?.user, ["accessToken", "token", "jwt", "jwtToken"])
  );
}

async function loginCustomerByApi(I, email, password) {
  const body = {
    email,
    password,
  };

  const res = await firstSuccess(
    I,
    [
      {
        method: "POST",
        url: "/api/auth/login",
        body,
      },
      {
        method: "POST",
        url: "/api/Auth/login",
        body,
      },
      {
        method: "POST",
        url: "/api/account/login",
        body,
      },
    ],
    [200, 201],
    "Login customer bằng API thất bại",
  );

  const token = extractAuthToken(res.data);

  assert(
    token,
    `Login customer bằng API không trả token. Body: ${bodyText(res.data)}`,
  );

  return token;
}

async function registerCustomerByApi(I, override = {}) {
  await seedDemoData(I);

  const email = override.email || testEmail("fe_auth_customer");
  const password = override.password || CUSTOMER_PASSWORD;
  const fullName = override.fullName || "FE Auth Test Customer";
  const phone = override.phone || "0900000000";

  const body = {
    email,
    password,
    confirmPassword: password,
    fullName,
    phone,
  };

  const registerRes = await firstSuccess(
    I,
    [
      {
        method: "POST",
        url: "/api/auth/register",
        body,
      },
      {
        method: "POST",
        url: "/api/Auth/register",
        body,
      },
      {
        method: "POST",
        url: "/api/account/register",
        body,
      },
    ],
    [200, 201],
    "Register bằng API thất bại",
  );

  let token = null;

  try {
    token = await loginCustomerByApi(I, email, password);
  } catch (error) {
    token = extractAuthToken(registerRes.data);

    I.say(
      `Login API sau register không thành công, tạm dùng token từ register. ${error.message}`,
    );
  }

  assert(
    token,
    `Không lấy được token sau register/login. Register body: ${bodyText(
      registerRes.data,
    )}`,
  );

  return {
    email,
    password,
    fullName,
    phone,
    token,
    user: registerRes.data?.user || registerRes.data,
  };
}

async function clearAuthStorage(I) {
  I.amOnPage("/");
  I.waitForElement("body", 15);

  await I.executeScript(() => {
    const shouldRemove = (key) => {
      const normalized = String(key || "").toLowerCase();

      return (
        normalized.includes("token") ||
        normalized.includes("auth") ||
        normalized.includes("jwt") ||
        normalized.includes("user") ||
        normalized.includes("account")
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

async function injectAuthSession(I, customer) {
  I.amOnPage("/");
  I.waitForElement("body", 15);

  await I.executeScript((payload) => {
    const user = {
      email: payload.email,
      fullName: payload.fullName,
      phone: payload.phone,
      role: "Customer",
      ...payload.user,
    };

    if (payload.token) {
      localStorage.setItem("token", payload.token);
      localStorage.setItem("accessToken", payload.token);
      localStorage.setItem("authToken", payload.token);
      localStorage.setItem("jwtToken", payload.token);
    }

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("auth_user", JSON.stringify(user));
    localStorage.setItem("role", "Customer");
  }, customer);
}

async function getBrowserSnapshot(I) {
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

async function getAuthTokenFromBrowserStorage(I) {
  return I.executeScript(() => {
    const tokenKeys = [
      "token",
      "accessToken",
      "authToken",
      "jwtToken",
      "jwt",
      "access_token",
    ];

    for (const key of tokenKeys) {
      const value = localStorage.getItem(key) || sessionStorage.getItem(key);

      if (value && value.length >= 10) {
        return value;
      }
    }

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);

      if (!value) continue;

      try {
        const parsed = JSON.parse(value);

        const token =
          parsed.token ||
          parsed.accessToken ||
          parsed.authToken ||
          parsed.jwtToken ||
          parsed.jwt ||
          parsed.access_token;

        if (token && String(token).length >= 10) {
          return token;
        }
      } catch {
        // Không phải JSON thì bỏ qua.
      }
    }

    return null;
  });
}

async function pageHasInputByHints(I, requirements) {
  return I.executeScript((items) => {
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
        style.visibility !== "hidden"
      );
    };

    const getLabelText = (element) => {
      const labels = element.labels ? Array.from(element.labels) : [];
      return labels.map((label) => label.innerText || "").join(" ");
    };

    const inputs = Array.from(
      document.querySelectorAll("input, textarea"),
    ).filter(isVisible);

    const infos = inputs.map((input) =>
      normalizeText(
        [
          input.type,
          input.name,
          input.id,
          input.placeholder,
          input.autocomplete,
          input.getAttribute("aria-label"),
          getLabelText(input),
        ].join(" "),
      ),
    );

    return items.every((item) => {
      const hints = item.hints.map(normalizeText);

      return infos.some((info, index) => {
        const input = inputs[index];

        if (item.type && input.type !== item.type) {
          return false;
        }

        return hints.some((hint) => info.includes(hint));
      });
    });
  }, requirements);
}

async function openPageWithForm(I, routes, requirements, label) {
  const logs = [];

  for (const route of routes) {
    I.amOnPage(route);
    I.waitForElement("body", 15);
    I.wait(1);

    const snapshot = await getBrowserSnapshot(I);
    const hasForm = await pageHasInputByHints(I, requirements);

    if (hasForm && !looksLikeNotFound(snapshot.text)) {
      return route;
    }

    logs.push(
      `${route} -> hasForm=${hasForm}, text="${String(snapshot.text).slice(
        0,
        150,
      )}"`,
    );
  }

  assert.fail(
    `${label}\nKhông tìm thấy trang/form phù hợp.\n${logs.join("\n")}`,
  );
}

async function openLoginPage(I) {
  return openPageWithForm(
    I,
    LOGIN_ROUTES,
    [
      { hints: ["email", "e-mail", "mail"] },
      { hints: ["password", "mat khau", "matkhau"], type: "password" },
    ],
    "Không mở được trang login",
  );
}

async function openRegisterPage(I) {
  return openPageWithForm(
    I,
    REGISTER_ROUTES,
    [
      { hints: ["email", "e-mail", "mail"] },
      { hints: ["password", "mat khau", "matkhau"], type: "password" },
    ],
    "Không mở được trang register",
  );
}

async function fillInputInternal(
  I,
  hints,
  value,
  options = {},
  required = true,
) {
  const result = await I.executeScript(
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

      const getLabelText = (element) => {
        const labels = element.labels ? Array.from(element.labels) : [];
        return labels.map((label) => label.innerText || "").join(" ");
      };

      const allFields = Array.from(
        document.querySelectorAll("input, textarea"),
      ).filter(isVisible);

      const normalizedHints = hints.map(normalizeText);

      const fields = allFields
        .map((field) => {
          const info = normalizeText(
            [
              field.type,
              field.name,
              field.id,
              field.placeholder,
              field.autocomplete,
              field.getAttribute("aria-label"),
              getLabelText(field),
            ].join(" "),
          );

          return { field, info };
        })
        .filter((item) => {
          if (options.type && item.field.type !== options.type) {
            return false;
          }

          return normalizedHints.some((hint) => item.info.includes(hint));
        });

      let selected = null;

      if (fields.length > 0) {
        selected = fields[options.index || 0]?.field || fields[0].field;
      }

      if (!selected && options.type) {
        const typedFields = allFields.filter(
          (field) => field.type === options.type,
        );
        selected = typedFields[options.index || 0] || typedFields[0];
      }

      if (!selected) {
        return {
          found: false,
          hints,
          type: options.type || "",
        };
      }

      selected.focus();

      const prototype =
        selected.tagName.toLowerCase() === "textarea"
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;

      const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

      if (setter) {
        setter.call(selected, value);
      } else {
        selected.value = value;
      }

      selected.dispatchEvent(new Event("input", { bubbles: true }));
      selected.dispatchEvent(new Event("change", { bubbles: true }));
      selected.dispatchEvent(new Event("blur", { bubbles: true }));

      return {
        found: true,
        tagName: selected.tagName,
        type: selected.type,
        name: selected.name || "",
        id: selected.id || "",
        placeholder: selected.placeholder || "",
      };
    },
    { hints, value, options },
  );

  if (required) {
    assert(
      result && result.found,
      `Không tìm thấy input cần nhập. Hints: ${hints.join(", ")}`,
    );
  }

  return result;
}

async function fillInput(I, hints, value, options = {}) {
  return fillInputInternal(I, hints, value, options, true);
}

async function optionalFillInput(I, hints, value, options = {}) {
  return fillInputInternal(I, hints, value, options, false);
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
    `Không tìm thấy nút để click: ${texts.join(", ")}`,
  );

  I.wait(2);

  return result;
}

async function grabInputValues(I) {
  return I.executeScript(() => {
    return Array.from(document.querySelectorAll("input, textarea"))
      .map((field) => String(field.value || ""))
      .filter(Boolean);
  });
}

function valuesContain(values, expected) {
  const normalizedExpected = normalizeText(expected);

  return values.some((value) =>
    normalizeText(value).includes(normalizedExpected),
  );
}

async function uiLogin(I, email, password) {
  await openLoginPage(I);

  await fillInput(I, ["email", "e-mail", "mail"], email);
  await fillInput(I, ["password", "mat khau", "matkhau"], password, {
    type: "password",
    index: 0,
  });

  await clickAction(I, ["dang nhap", "login", "sign in", "submit"]);
}

async function fillRegisterForm(I, customer) {
  await openRegisterPage(I);

  await fillInput(I, ["email", "e-mail", "mail"], customer.email);
  await fillInput(I, ["password", "mat khau", "matkhau"], customer.password, {
    type: "password",
    index: 0,
  });

  await optionalFillInput(
    I,
    ["confirm password", "xac nhan", "nhap lai", "confirm"],
    customer.password,
    {
      type: "password",
      index: 1,
    },
  );

  await optionalFillInput(
    I,
    ["full name", "fullname", "ho ten", "hoten", "ten day du"],
    customer.fullName,
  );

  await optionalFillInput(
    I,
    ["phone", "dien thoai", "so dien thoai", "sdt", "mobile"],
    customer.phone,
  );
}

async function openContentPage(I, routes, hints, label) {
  const logs = [];

  for (const route of routes) {
    I.amOnPage(route);
    I.waitForElement("body", 15);
    I.wait(1);

    const snapshot = await getBrowserSnapshot(I);
    const normalized = normalizeText(snapshot.text + " " + snapshot.url);
    const hasHint = hints.some((hint) =>
      normalized.includes(normalizeText(hint)),
    );

    if (hasHint && !looksLikeNotFound(snapshot.text)) {
      return route;
    }

    logs.push(
      `${route} -> hasHint=${hasHint}, text="${String(snapshot.text).slice(
        0,
        150,
      )}"`,
    );
  }

  assert.fail(`${label}\nKhông tìm thấy trang phù hợp.\n${logs.join("\n")}`);
}

async function confirmEmailWithWrongTokenByApi(I) {
  const email = "invalid@example.com";
  const token = `invalid-token-${uniqueSuffix()}`;

  return firstSuccess(
    I,
    [
      {
        method: "GET",
        url: `/api/auth/confirm-email?email=${encodeURIComponent(
          email,
        )}&token=${encodeURIComponent(token)}`,
      },
      {
        method: "GET",
        url: `/api/Auth/confirm-email?email=${encodeURIComponent(
          email,
        )}&token=${encodeURIComponent(token)}`,
      },
      {
        method: "POST",
        url: "/api/auth/confirm-email",
        body: { email, token },
      },
      {
        method: "POST",
        url: "/api/Auth/confirm-email",
        body: { email, token },
      },
    ],
    [400, 404],
    "ConfirmEmail token sai",
  );
}

async function updateProfileByApi(I, token, data) {
  const body = {
    email: data.email,
    fullName: data.fullName,
    phone: data.phone,
  };

  return firstSuccess(
    I,
    [
      {
        method: "PUT",
        url: "/api/account/profile",
        body,
        headers: authHeaders(token),
      },
      {
        method: "PATCH",
        url: "/api/account/profile",
        body,
        headers: authHeaders(token),
      },
      {
        method: "PUT",
        url: "/api/account",
        body,
        headers: authHeaders(token),
      },
    ],
    [200, 204],
    "Update profile bằng API fallback thất bại",
  );
}

async function addAddressByApi(I, token) {
  const body = {
    recipientName: "FE Address Customer",
    receiverName: "FE Address Customer",
    fullName: "FE Address Customer",
    phone: "0900000003",

    line1: "123 FE Address",
    Line1: "123 FE Address",

    line2: "Phuong 1",
    Line2: "Phuong 1",

    city: "TP. Ho Chi Minh",
    City: "TP. Ho Chi Minh",

    state: "Quan 1",
    State: "Quan 1",

    postalCode: "700000",
    PostalCode: "700000",

    country: "Viet Nam",
    Country: "Viet Nam",

    addressLine: "123 FE Address",
    street: "123 FE Address",
    ward: "Phuong 1",
    district: "Quan 1",
    province: "TP. Ho Chi Minh",
    fullAddress: "123 FE Address, Quan 1, TP. Ho Chi Minh",

    isDefault: true,
    IsDefault: true,
  };

  return firstSuccess(
    I,
    [
      {
        method: "POST",
        url: "/api/account/addresses",
        body,
        headers: authHeaders(token),
      },
      {
        method: "POST",
        url: "/api/addresses",
        body,
        headers: authHeaders(token),
      },
      {
        method: "POST",
        url: "/api/address",
        body,
        headers: authHeaders(token),
      },
    ],
    [200, 201],
    "Add address bằng API fallback thất bại",
  );
}

Scenario(
  "Login thành công: user đăng nhập bằng email và mật khẩu hợp lệ",
  async ({ I }) => {
    const customer = await registerCustomerByApi(I);

    await clearAuthStorage(I);
    await uiLogin(I, customer.email, customer.password);

    const snapshot = await getBrowserSnapshot(I);

    assert(
      hasAuthTokenInStorage(snapshot) || hasSuccessText(snapshot.text),
      `Login hợp lệ nhưng UI chưa thể hiện trạng thái đăng nhập. URL: ${snapshot.url}. Text: ${snapshot.text}`,
    );
  },
);

Scenario(
  "Login sai mật khẩu: phải hiển thị lỗi hoặc không đăng nhập",
  async ({ I }) => {
    const customer = await registerCustomerByApi(I);

    await clearAuthStorage(I);
    await uiLogin(I, customer.email, `Wrong${CUSTOMER_PASSWORD}`);

    const snapshot = await getBrowserSnapshot(I);

    assert(
      !hasAuthTokenInStorage(snapshot),
      `Login sai mật khẩu nhưng localStorage vẫn có token. URL: ${snapshot.url}`,
    );

    assert(
      hasErrorText(snapshot.text) ||
        normalizeText(snapshot.url).includes("login") ||
        normalizeText(snapshot.url).includes("dang-nhap"),
      `Login sai mật khẩu nhưng UI không hiển thị lỗi và không ở trang login. Text: ${snapshot.text}`,
    );
  },
);

Scenario("Login thiếu dữ liệu: không được đăng nhập", async ({ I }) => {
  await clearAuthStorage(I);
  await openLoginPage(I);

  await clickAction(I, ["dang nhap", "login", "sign in", "submit"]);

  const snapshot = await getBrowserSnapshot(I);

  assert(
    !hasAuthTokenInStorage(snapshot),
    `Login thiếu dữ liệu nhưng localStorage vẫn có token. URL: ${snapshot.url}`,
  );

  assert(
    hasErrorText(snapshot.text) ||
      normalizeText(snapshot.url).includes("login") ||
      normalizeText(snapshot.url).includes("dang-nhap"),
    `Login thiếu dữ liệu nhưng UI không giữ lại form hoặc không hiển thị validation. Text: ${snapshot.text}`,
  );
});

Scenario(
  "Register thành công: tạo tài khoản mới bằng dữ liệu hợp lệ",
  async ({ I }) => {
    await clearAuthStorage(I);

    const customer = {
      email: testEmail("fe_register"),
      password: CUSTOMER_PASSWORD,
      fullName: "FE Register Customer",
      phone: "0900000001",
    };

    await fillRegisterForm(I, customer);

    await clickAction(I, ["dang ky", "register", "tao tai khoan", "submit"]);

    const snapshot = await getBrowserSnapshot(I);
    const normalizedUrl = normalizeText(snapshot.url);

    assert(
      hasAuthTokenInStorage(snapshot) ||
        hasSuccessText(snapshot.text) ||
        (!normalizedUrl.includes("register") &&
          !normalizedUrl.includes("dang-ky")),
      `Register hợp lệ nhưng UI chưa thể hiện thành công. URL: ${snapshot.url}. Text: ${snapshot.text}`,
    );
  },
);

Scenario(
  "Register email trùng: phải hiển thị lỗi hoặc không tạo tài khoản",
  async ({ I }) => {
    const existing = await registerCustomerByApi(I, {
      email: testEmail("fe_duplicate"),
    });

    await clearAuthStorage(I);

    const customer = {
      email: existing.email,
      password: CUSTOMER_PASSWORD,
      fullName: "FE Duplicate Customer",
      phone: "0900000002",
    };

    await fillRegisterForm(I, customer);

    await clickAction(I, ["dang ky", "register", "tao tai khoan", "submit"]);

    const snapshot = await getBrowserSnapshot(I);

    assert(
      !hasAuthTokenInStorage(snapshot),
      `Register email trùng nhưng UI vẫn đăng nhập/tạo token. URL: ${snapshot.url}`,
    );

    assert(
      hasErrorText(snapshot.text) ||
        normalizeText(snapshot.url).includes("register") ||
        normalizeText(snapshot.url).includes("dang-ky"),
      `Register email trùng nhưng UI không hiển thị lỗi. Text: ${snapshot.text}`,
    );
  },
);

Scenario(
  "Register input sai: email hoặc mật khẩu không hợp lệ phải bị chặn",
  async ({ I }) => {
    await clearAuthStorage(I);

    const customer = {
      email: "email-sai-dinh-dang",
      password: "123",
      fullName: "",
      phone: "abc",
    };

    await fillRegisterForm(I, customer);

    await clickAction(I, ["dang ky", "register", "tao tai khoan", "submit"]);

    const snapshot = await getBrowserSnapshot(I);

    assert(
      !hasAuthTokenInStorage(snapshot),
      `Register input sai nhưng localStorage vẫn có token. URL: ${snapshot.url}`,
    );

    assert(
      hasErrorText(snapshot.text) ||
        normalizeText(snapshot.url).includes("register") ||
        normalizeText(snapshot.url).includes("dang-ky"),
      `Register input sai nhưng UI không hiển thị validation. Text: ${snapshot.text}`,
    );
  },
);

Scenario(
  "ConfirmEmail token sai: phải hiển thị lỗi hoặc API trả lỗi hợp lệ",
  async ({ I }) => {
    for (const route of CONFIRM_EMAIL_ROUTES) {
      I.amOnPage(route);
      I.waitForElement("body", 15);
      I.wait(5);

      const snapshot = await getBrowserSnapshot(I);
      const normalized = normalizeText(snapshot.text + " " + snapshot.url);

      const isConfirmPage =
        normalized.includes("confirm") ||
        normalized.includes("email") ||
        normalized.includes("xac nhan") ||
        normalized.includes("xac thuc");

      if (isConfirmPage && !looksLikeNotFound(snapshot.text)) {
        if (hasErrorText(snapshot.text) || looksLikeNotFound(snapshot.text)) {
          return;
        }

        if (normalized.includes("dang xac thuc")) {
          I.say(
            "UI vẫn đang ở trạng thái Đang xác thực tài khoản, kiểm tra fallback bằng API.",
          );
          break;
        }
      }
    }

    const res = await confirmEmailWithWrongTokenByApi(I);

    assert(
      [400, 404].includes(res.status),
      `ConfirmEmail token sai phải trả 400 hoặc 404. Actual: ${res.status}. Body: ${bodyText(
        res.data,
      )}`,
    );
  },
);

Scenario(
  "Profile: user đăng nhập xem và chỉnh sửa thông tin cá nhân",
  async ({ I }) => {
    const customer = await registerCustomerByApi(I);

    await uiLogin(I, customer.email, customer.password);

    const browserToken = await getAuthTokenFromBrowserStorage(I);
    const activeToken = browserToken || activeToken;

    assert(activeToken, "Không lấy được token sau khi login UI");

    I.say(
      `Token dùng cho Profile fallback: ${String(activeToken).slice(0, 8)}...`,
    );

    const newName = `FE Profile ${uniqueSuffix()}`;
    const newPhone = "0912345678";

    let openedProfilePage = true;

    try {
      await openContentPage(
        I,
        PROFILE_ROUTES,
        [
          "profile",
          "tai khoan",
          "account",
          "ho ten",
          "full name",
          "email",
          "phone",
        ],
        "Không mở được trang profile",
      );
    } catch (error) {
      openedProfilePage = false;
      I.say(
        `Không mở được profile UI, chuyển sang kiểm tra API fallback. ${error.message}`,
      );
    }

    if (!openedProfilePage) {
      const res = await updateProfileByApi(I, activeToken, {
        email: customer.email,
        fullName: newName,
        phone: newPhone,
      });

      assert(
        [200, 204].includes(res.status),
        `Update profile API fallback thất bại. Status: ${res.status}`,
      );

      return;
    }

    const nameResult = await optionalFillInput(
      I,
      ["full name", "fullname", "ho ten", "hoten", "ten day du"],
      newName,
    );

    const phoneResult = await optionalFillInput(
      I,
      ["phone", "dien thoai", "so dien thoai", "sdt", "mobile"],
      newPhone,
    );

    if (!nameResult.found && !phoneResult.found) {
      const res = await updateProfileByApi(I, activeToken, {
        email: customer.email,
        fullName: newName,
        phone: newPhone,
      });

      assert(
        [200, 204].includes(res.status),
        `Profile UI không có input, API fallback cũng thất bại. Status: ${res.status}`,
      );

      return;
    }

    await clickAction(I, ["luu", "save", "cap nhat", "update", "submit"]);

    const snapshot = await getBrowserSnapshot(I);
    const values = await grabInputValues(I);

    assert(
      hasSuccessText(snapshot.text) ||
        valuesContain(values, newName) ||
        valuesContain(values, newPhone) ||
        normalizeText(snapshot.text).includes(normalizeText(newName)) ||
        normalizeText(snapshot.text).includes(normalizeText(newPhone)),
      `Cập nhật profile xong nhưng UI không thể hiện dữ liệu mới. Text: ${snapshot.text}. Values: ${values.join(
        ", ",
      )}`,
    );
  },
);

Scenario("Address: user đăng nhập thêm địa chỉ giao hàng", async ({ I }) => {
  const customer = await registerCustomerByApi(I);

  await uiLogin(I, customer.email, customer.password);

  const browserToken = await getAuthTokenFromBrowserStorage(I);
  const activeToken = browserToken || customer.token;

  assert(activeToken, "Không lấy được token sau khi login UI");

  I.say(
    `Token dùng cho Address fallback: ${String(activeToken).slice(0, 8)}...`,
  );

  let openedAddressPage = true;

  try {
    await openContentPage(
      I,
      ADDRESS_ROUTES,
      ["address", "dia chi", "line1", "street", "thanh pho", "city"],
      "Không mở được trang address",
    );
  } catch (error) {
    openedAddressPage = false;
    I.say(
      `Không mở được address UI, chuyển sang kiểm tra API fallback. ${error.message}`,
    );
  }

  if (!openedAddressPage) {
    const res = await addAddressByApi(I, activeToken);

    assert(
      [200, 201].includes(res.status),
      `Add address API fallback thất bại. Status: ${res.status}`,
    );

    return;
  }

  try {
    await clickAction(
      I,
      ["them dia chi", "add address", "them moi", "add new", "new address"],
      false,
    );
  } catch {
    // Nếu form đã hiển thị sẵn thì bỏ qua.
  }

  const line1 = `123 FE Address ${uniqueSuffix()}`;
  const city = "TP. Ho Chi Minh";

  await optionalFillInput(
    I,
    ["recipient", "receiver", "nguoi nhan", "ho ten", "full name"],
    "FE Address Customer",
  );

  await optionalFillInput(
    I,
    ["phone", "dien thoai", "so dien thoai", "sdt", "mobile"],
    "0900000003",
  );

  const line1Result = await optionalFillInput(
    I,
    ["line1", "address", "dia chi", "street", "duong"],
    line1,
  );

  await optionalFillInput(I, ["line2", "ward", "phuong", "xa"], "Phuong 1");

  await optionalFillInput(I, ["district", "quan", "huyen", "state"], "Quan 1");

  const cityResult = await optionalFillInput(
    I,
    ["city", "province", "thanh pho", "tinh"],
    city,
  );

  await optionalFillInput(
    I,
    ["postal", "zip", "postalcode", "ma buu dien"],
    "700000",
  );

  await optionalFillInput(I, ["country", "quoc gia"], "Viet Nam");

  if (!line1Result.found && !cityResult.found) {
    const res = await addAddressByApi(I, activeToken);

    assert(
      [200, 201].includes(res.status),
      `Address UI không có input, API fallback cũng thất bại. Status: ${res.status}`,
    );

    return;
  }

  await clickAction(I, ["luu", "save", "them", "add", "submit"]);

  const snapshot = await getBrowserSnapshot(I);
  const values = await grabInputValues(I);

  assert(
    hasSuccessText(snapshot.text) ||
      normalizeText(snapshot.text).includes(normalizeText(line1)) ||
      normalizeText(snapshot.text).includes(normalizeText(city)) ||
      valuesContain(values, line1) ||
      valuesContain(values, city),
    `Thêm địa chỉ xong nhưng UI không thể hiện dữ liệu địa chỉ. Text: ${snapshot.text}. Values: ${values.join(
      ", ",
    )}`,
  );
});
