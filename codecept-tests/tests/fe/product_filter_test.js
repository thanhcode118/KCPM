const assert = require('assert');

Feature('FE - Product Filter');

const SEARCH_INPUT =
  'input[placeholder="Tên sản phẩm, mã SKU, chất liệu..."]';

const RESULT_CARD = 'article';
const RESULT_NAME = 'article h3';

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

async function getResultNames(I) {
  const names = await I.grabTextFromAll(RESULT_NAME);

  return names
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
}

Scenario('Lọc sản phẩm theo từ khóa den ngu phải hiển thị đúng sản phẩm', async ({ I }) => {
  const keyword = 'tap de';

  I.amOnPage('/search');

  I.waitForElement(SEARCH_INPUT, 10);

  I.fillField(SEARCH_INPUT, keyword);

  I.waitForText('Tìm thấy', 10);
  I.waitForElement(RESULT_CARD, 10);

  const productNames = await getResultNames(I);

  assert(
    productNames.length > 0,
    `Không có sản phẩm nào sau khi lọc từ khóa "${keyword}"`
  );

  const invalidProducts = productNames.filter((name) => {
    return !normalizeText(name).includes(keyword);
  });

  assert.strictEqual(
    invalidProducts.length,
    0,
    `Có sản phẩm không đúng bộ lọc "${keyword}": ${invalidProducts.join(', ')}`
  );
});

Scenario('Lọc từ khóa không tồn tại phải hiển thị không có kết quả', async ({ I }) => {
  const keyword = 'sanphamkhongtontai999999';

  I.amOnPage(`/search?q=${keyword}`);

  I.waitForText('Không tìm thấy sản phẩm phù hợp', 10);
  I.see('Không có kết quả khớp');

  const productCount = await I.grabNumberOfVisibleElements(RESULT_CARD);

  assert.strictEqual(
    productCount,
    0,
    `Từ khóa không tồn tại nhưng vẫn hiển thị ${productCount} sản phẩm`
  );
});