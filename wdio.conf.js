exports.config = {
  runner: 'local',
  specs: ['./tests/**/*.test.js'],
  exclude: [],
  maxInstances: 5,
  // NOTE: capabilities are set at the bottom of the file instead!
  //capabilities: [],
  // Level of logging verbosity: silent | verbose | command | data | result | error
  logLevel: process.env.EE_LOG_LEVEL || 'error',
  bail: 0,
  baseUrl: 'http://127.0.0.1:3000',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  services: [],

  framework: 'jasmine',
  reporters: ['spec'],
  jasmineNodeOpts: {
    defaultTimeoutInterval: 60000,
  },
};

exports.config.capabilities = [
  {
    browserName: 'chrome',
    'goog:chromeOptions': {},
  },
  {
    browserName: 'firefox',
    'moz:firefoxOptions': {},
  },
];

if (process.env.EE_BROWSER) {
  exports.config.capabilities = exports.config.capabilities.filter(
    (conf) => conf.browserName === process.env.EE_BROWSER
  );
}

if (process.env.EE_HEADLESS) {
  const chromeCapability = exports.config.capabilities.find((conf) => conf.browserName === 'chrome');
  if (chromeCapability) {
    chromeCapability['goog:chromeOptions'] = Object.assign(chromeCapability['goog:chromeOptions'], {
      args: ['--headless', '--disable-gpu', '--window-size=1280,800'],
    });
  }

  const firefoxCapability = exports.config.capabilities.find((conf) => conf.browserName === 'firefox');
  if (firefoxCapability) {
    firefoxCapability['moz:firefoxOptions'] = Object.assign(firefoxCapability['moz:firefoxOptions'], {
      args: ['-headless', '--window-size=1280,800'],
    });
  }
}

if (process.env.EE_WDIO_EXEC_ARGV) {
  exports.config.execArgv = [process.env.EE_WDIO_EXEC_ARGV];
}
