const assert = require('assert');

Feature('BE - Product API');

function extractProducts(responseData) {
  if (Array.isArray(responseData)) return responseData;

  if (Array.isArray(responseData.items)) return responseData.items;
  if (Array.isArray(responseData.products)) return responseData.products;
  if (Array.isArray(responseData.result)) return responseData.result;

  if (Array.isArray(responseData.data)) return responseData.data;
  if (Array.isArray(responseData.data?.items)) return responseData.data.items;
  if (Array.isArray(responseData.data?.products)) return responseData.data.products;
  if (Array.isArray(responseData.data?.result)) return responseData.data.result;

  return [];
}

Scenario('Lấy danh sách sản phẩm thành công', async ({ I }) => {
  const res = await I.sendGetRequest('/api/products?page=1&pageSize=20');

  assert(
    res.status >= 200 && res.status < 300,
    `API /api/products trả về status ${res.status}`
  );

  const products = extractProducts(res.data);

  assert(
    products.length > 0,
    `API /api/products không trả về sản phẩm nào. Response: ${JSON.stringify(res.data)}`
  );
});

Scenario('Tìm kiếm sản phẩm theo keyword den', async ({ I }) => {
  const keyword = 'den';

  const res = await I.sendGetRequest(`/api/products?q=${keyword}`);

  assert(
    res.status >= 200 && res.status < 300,
    `API /api/products?q=${keyword} trả về status ${res.status}`
  );

  const products = extractProducts(res.data);

  assert(
    Array.isArray(products),
    'Danh sách sản phẩm trả về không phải array'
  );
});

Scenario('Lấy sản phẩm không tồn tại phải trả lỗi', async ({ I }) => {
  const res = await I.sendGetRequest('/api/products/99999999');

  assert(
    res.status === 404 || res.status === 400,
    `API sản phẩm không tồn tại phải trả 404 hoặc 400, hiện tại trả ${res.status}`
  );
});