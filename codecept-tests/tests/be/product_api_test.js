const assert = require('assert');

Feature('BE - Product API');

Scenario('Lấy danh sách sản phẩm thành công', async ({ I }) => {
  const res = await I.sendGetRequest('/api/products');

  I.seeResponseCodeIsSuccessful();

  assert(res.data, 'API không trả về dữ liệu');
});

Scenario('Tìm kiếm sản phẩm theo keyword den', async ({ I }) => {
  const keyword = 'den';

  const res = await I.sendGetRequest(`/api/products?q=${keyword}`);

  I.seeResponseCodeIsSuccessful();

  const data = res.data?.items || res.data?.data || res.data || [];

  assert(Array.isArray(data), 'Response products không phải array');

  assert(
    data.length > 0,
    `Không có sản phẩm nào khi tìm keyword "${keyword}"`
  );
});

Scenario('Lấy sản phẩm không tồn tại phải trả lỗi', async ({ I }) => {
  await I.sendGetRequest('/api/products/99999999');

  I.seeResponseCodeIs(404);
});