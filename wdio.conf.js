const seleniumVersions = {
  // check for more recent versions of selenium here:
  // https://selenium-release.storage.googleapis.com/index.html
  version: '3.141.59',
  baseURL: 'https://selenium-release.storage.googleapis.com',
  drivers: {
    chrome: {
      // check for more recent versions of chrome driver here:
      // https://chromedriver.storage.googleapis.com/index.html
      version: '86.0.4240.22',
      arch: process.arch,
      baseURL: 'https://chromedriver.storage.googleapis.com'
    },
    firefox: {
      // check for more recent versions of geckodriver here:
      // https://github.com/mozilla/geckodriver/releases/
      version: '0.27.0',
      arch: process.arch,
      baseURL: 'https://github.com/mozilla/geckodriver/releases/download'
    },
  },
};

exports.config = {
  runner: 'local',
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
  bail: 0,
  baseUrl: 'http://127.0.0.1:3000',
  waitforTimeout: 5000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,

  services: ['selenium-standalone'],
  seleniumArgs: seleniumVersions,
  seleniumInstallArgs: seleniumVersions,

  framework: 'jasmine',
  reporters: ['spec'],
  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  },
  before: function (capabilities, specs) {
    // eslint-disable-next-line no-undef
    browser.setTimeout({ 'implicit': 5000 });
    // eslint-disable-next-line no-undef
    browser.setTimeout({ 'script': 5000 });
  },
};

exports.config.capabilities = [
  {
    browserName: 'chrome',
    'goog:chromeOptions': {
    }
  },
  {
    browserName: 'firefox',
    'moz:firefoxOptions': {
    }
  }
];

if (process.env.SELENIUM_BROWSER) {
  exports.config.capabilities = exports.config.capabilities.filter(conf => conf.browserName === process.env.SELENIUM_BROWSER);
}

if (process.env.E2E_HEADLESS) {
  const chromeCapability = exports.config.capabilities.find(conf => conf.browserName === 'chrome');
  if (chromeCapability) {
    chromeCapability['goog:chromeOptions'] = Object.assign(chromeCapability['goog:chromeOptions'], {
      args: ['--headless', '--disable-gpu', '--window-size=1280,800']
    });
  }

  const firefoxCapability = exports.config.capabilities.find(conf => conf.browserName === 'firefox');
  if (firefoxCapability) {
    firefoxCapability['moz:firefoxOptions'] = Object.assign(firefoxCapability['moz:firefoxOptions'], {
      args: ['-headless', '--window-size=1280,800']
    });
  }
}

if (process.env.E2E_WDIO_EXEC_ARGV) {
  exports.config.execArgv = [process.env.E2E_WDIO_EXEC_ARGV];
}
