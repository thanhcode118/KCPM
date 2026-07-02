exports.config = {
  tests: './tests/**/*_test.js',
  output: './output',

  helpers: {
    Playwright: {
      url: process.env.FE_URL || 'http://localhost:3000',
      browser: 'chromium',
      show: true,
      waitForTimeout: 10000,
      waitForNavigation: 'domcontentloaded'
    },

    REST: {
      endpoint: process.env.API_URL || 'http://localhost:5020',
      defaultHeaders: {
        'Content-Type': 'application/json'
      }
    }
  },

  include: {
    I: './steps_file.js'
  },

  name: 'KCPM HomeDecorShop CodeceptJS Tests'
};