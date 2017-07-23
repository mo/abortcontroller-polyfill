exports.config = {
  specs: [
    './tests/**/*.test.js'
  ],
  exclude: [],
  maxInstances: 5,
  // NOTE: capabilities are set at the bottom of the file instead!
  //capabilities: [],
  sync: true,
  // Level of logging verbosity: silent | verbose | command | data | result | error
  logLevel: process.env.E2E_LOG_LEVEL || 'error',
  coloredLogs: true,
  bail: 0,
  baseUrl: 'http://127.0.0.1:3000',
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  services: ['selenium-standalone'],
  framework: 'jasmine',
  reporters: ['spec'],
  jasmineNodeOpts: {
    defaultTimeoutInterval: 300000,
    expectationResultHandler: function(passed, assertion) {
    }
  },
  before: function (capabilities, specs) {
    // eslint-disable-next-line no-undef
    browser.timeouts('implicit', 30000);
    // eslint-disable-next-line no-undef
    browser.timeouts('script', 20000);
  },
};

if (process.env.SELENIUM_BROWSER) {
  exports.config.capabilities = [{
    browserName: process.env.SELENIUM_BROWSER
  }];
} else {
  exports.config.capabilities = [
    {
      browserName: 'chrome'
    },
    {
      browserName: 'firefox'
    }
  ];
}

if (process.env.E2E_HEADLESS) {
  if (!['chrome', ''].includes(process.env.SELENIUM_BROWSER)) {
    throw 'ERROR: Headless mode is only compatiable with chrome.';
  }
  const chromeCapability = exports.config.capabilities.find(conf => conf.browserName === 'chrome');
  chromeCapability.chromeOptions = {
    args: ['--headless', '--disable-gpu', '--window-size=1280,800']
  };
}

if (process.env.E2E_WDIO_EXEC_ARGV) {
  exports.config.execArgv = [process.env.E2E_WDIO_EXEC_ARGV];
}
