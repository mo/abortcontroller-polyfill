const chalk = require('chalk');
const path = require('path');

describe('basic tests', () => {

  it('abort during fetch', () => {
    browser.url('file://' + path.join(__dirname, 'testpage.html'));
    var res = browser.executeAsync(async (done) => {
      setTimeout(() => {
        done({name: 'fail'});
      }, 2000);
      const controller = new AbortController();
      const signal = controller.signal;
      setTimeout(() => {
        controller.abort();
      }, 500);
      try {
        await fetch('http://httpstat.us/200?sleep=1000', {signal});
      } catch (err) {
        done(err);
      }
    });
    const err = res.value;
    expect(err.name).toBe('AbortError');
    expect(getJSErrors().length).toBe(0);
  });

  it('abort before fetch started', () => {
    browser.url('file://' + path.join(__dirname, 'testpage.html'));
    var res = browser.executeAsync(async (done) => {
      setTimeout(() => {
        done({name: 'fail'});
      }, 2000);
      const controller = new AbortController();
      controller.abort();
      const signal = controller.signal;
      try {
        await fetch('http://httpstat.us/200?sleep=1000', {signal});
      } catch (err) {
        done(err);
      }
    });
    const err = res.value;
    expect(err.name).toBe('AbortError');
    expect(getJSErrors().length).toBe(0);
  });

  it('fetch without aborting', () => {
    browser.url('file://' + path.join(__dirname, 'testpage.html'));
    var res = browser.executeAsync(async (done) => {
      setTimeout(() => {
        done({name: 'fail'});
      }, 2000);
      const controller = new AbortController();
      const signal = controller.signal;
      try {
        await fetch('http://httpstat.us/200?sleep=50', {signal});
        done('PASS');
      } catch (err) {
        done(err);
      }
    });
    expect(res.value).toBe('PASS');
    expect(getJSErrors().length).toBe(0);
  });

});


function getJSErrors() {
  if (browser.desiredCapabilities.browserName === 'firefox') {
    console.log('NOTE: cannot get browser log in firefox so cannot verify "no JS errors"');
  } else {
    const allLogEntries = browser.log('browser').value;
    const jsErrors = allLogEntries.filter(logEntry => logEntry.level === 'SEVERE');
    allLogEntries.forEach(error => {
      if (error.level == 'SEVERE') {
        console.log(chalk.red(`[${error.level}] ${error.message}`));
      } else {
        console.log(`[${error.level}] ${error.message}`);
      }
    });
    return jsErrors;
  }
}
