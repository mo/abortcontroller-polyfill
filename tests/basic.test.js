const chalk = require('chalk');
const path = require('path');
const http = require('http');
const url = require('url');
const fs = require('fs');

const TESTPAGE_URL_BASE = 'file://' + path.resolve(__dirname, 'testpage.html').replace('\\', '/');

const createFetchTargetServer = () => {
  const server = http
    .createServer((req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      const queryParams = url.parse(req.url, true).query;
      const sleepMillis = queryParams.sleepMillis;
      setTimeout(() => {
        res.writeHead(200);
        res.end();
      }, sleepMillis);
    })
    .listen(0);
  const boundListenPort = server.address().port;
  return { server, port: boundListenPort, baseUrl: `http://127.0.0.1:${boundListenPort}` };
};

const runBasicTests = (testSuiteTitle, TESTPAGE_URL) => {
  describe(testSuiteTitle, () => {
    it('check version', async () => {
      await browser.url(TESTPAGE_URL);
      const browserData = await browser.executeAsync(async (done) => {
        done(window.DetectedBrowserData);
      });
      expect(typeof browserData.name === 'string').toBe(true);
      console.log('Tests running on: ' + JSON.stringify(browserData, null, 2));
    });

    it('Request object has .signal', async () => {
      await browser.url(TESTPAGE_URL);
      const result = await browser.executeAsync(async (done) => {
        const controller = new AbortController();
        const signal = controller.signal;
        const request = new Request('/', { signal });
        if (!request.signal) {
          done('FAIL: missing request.signal');
        }
        if (!Request.prototype.isPrototypeOf(request)) {
          done('FAIL: wrong prototype');
        }
        done('PASS');
      });
      expect(result).toBe('PASS');
    });

    it('abort during fetch', async () => {
      const { server, baseUrl } = createFetchTargetServer();
      await browser.url(TESTPAGE_URL);
      const { errorName, signalReason } = await browser.executeAsync(async (baseUrl, done) => {
        setTimeout(() => {
          done({ name: 'fail' });
        }, 2000);
        const controller = new AbortController();
        const signal = controller.signal;
        setTimeout(() => {
          controller.abort();
        }, 500);
        try {
          await fetch(`${baseUrl}?sleepMillis=1000`, { signal });
        } catch (error) {
          done({ errorName: error.name, signalReason: signal.reason });
        }
      }, baseUrl);
      expect(errorName).toBe('AbortError');
      expect(signalReason.message).toBe('signal is aborted without reason');
      server.close();
    });

    it('abort when multiple fetches are using the same signal', async () => {
      const { server, baseUrl } = createFetchTargetServer();
      await browser.url(TESTPAGE_URL);
      const errors = await browser.executeAsync(async (baseUrl, done) => {
        setTimeout(() => {
          done({ name: 'fail' });
        }, 2000);
        const controller = new AbortController();
        const signal = controller.signal;
        setTimeout(() => {
          controller.abort();
        }, 500);
        const requests = [
          fetch(`${baseUrl}?sleepMillis=900`, { signal }),
          fetch(`${baseUrl}?sleepMillis=1100`, { signal }),
        ];
        const errors = [];
        for (let req of requests) {
          try {
            await req;
            errors.push({ name: 'fail' });
          } catch (err) {
            errors.push(err);
          }
        }
        done(errors);
      }, baseUrl);
      expect(errors[0].name).toBe('AbortError');
      expect(errors[1].name).toBe('AbortError');
      server.close();
    });

    it('abort during fetch when Request has signal', async () => {
      const { server, baseUrl } = createFetchTargetServer();
      await browser.url(TESTPAGE_URL);
      const err = await browser.executeAsync(async (baseUrl, done) => {
        setTimeout(() => {
          done({ name: 'fail' });
        }, 2000);
        const controller = new AbortController();
        const signal = controller.signal;
        setTimeout(() => {
          controller.abort();
        }, 500);
        try {
          let request = new Request(`${baseUrl}?sleepMillis=1000`, { signal });
          await fetch(request);
        } catch (err) {
          done(err);
        }
      }, baseUrl);
      expect(err.name).toBe('AbortError');
      server.close();
    });

    it('abort before fetch started', async () => {
      const { server, baseUrl } = createFetchTargetServer();
      await browser.url(TESTPAGE_URL);
      const err = await browser.executeAsync(async (baseUrl, done) => {
        setTimeout(() => {
          done({ name: 'fail' });
        }, 2000);
        const controller = new AbortController();
        controller.abort();
        const signal = controller.signal;
        try {
          await fetch(`${baseUrl}?sleepMillis=1000`, { signal });
        } catch (err) {
          done(err);
        }
      }, baseUrl);
      expect(err.name).toBe('AbortError');
      server.close();
    });

    it('abort before fetch started, verify no HTTP request is made', async () => {
      const server = http
        .createServer((req, res) => {
          fail('fetch() made an HTTP request despite pre-aborted signal');
        })
        .listen(0);
      const boundListenPort = server.address().port;
      await browser.url(TESTPAGE_URL);
      const err = await browser.executeAsync(async (boundListenPort, done) => {
        setTimeout(() => {
          done({ name: 'fail' });
        }, 2000);
        const controller = new AbortController();
        controller.abort();
        const signal = controller.signal;
        try {
          await fetch(`http://127.0.0.1:${boundListenPort}`, { signal });
          done({ name: 'fail' });
        } catch (err) {
          done(err);
        }
      }, boundListenPort);
      expect(err.name).toBe('AbortError');
      server.close();
    });

    it('fetch without aborting', async () => {
      const { server, baseUrl } = createFetchTargetServer();
      await browser.url(TESTPAGE_URL);
      const result = await browser.executeAsync(async (baseUrl, done) => {
        setTimeout(() => {
          done({ name: 'fail' });
        }, 2000);
        const controller = new AbortController();
        const signal = controller.signal;
        try {
          await fetch(`${baseUrl}?sleepMillis=50`, { signal });
          done('PASS');
        } catch (err) {
          done(err);
        }
      }, baseUrl);
      expect(result).toBe('PASS');
      server.close();
    });

    it('fetch without signal set', async () => {
      const { server, baseUrl } = createFetchTargetServer();
      await browser.url(TESTPAGE_URL);
      const result = await browser.executeAsync(async (baseUrl, done) => {
        setTimeout(() => {
          done({ name: 'fail' });
        }, 2000);
        try {
          await fetch(`${baseUrl}?sleepMillis=50`);
          done('PASS');
        } catch (err) {
          done(err);
        }
      }, baseUrl);
      expect(result).toBe('PASS');
      server.close();
    });

    it('event listener fires "abort" event', async () => {
      await browser.url(TESTPAGE_URL);
      const result = await browser.executeAsync(async (done) => {
        setTimeout(() => {
          done({ name: 'fail' });
        }, 2000);
        const controller = new AbortController();
        controller.signal.addEventListener('abort', () => {
          done('PASS');
        });
        controller.abort();
      });
      expect(result).toBe('PASS');
    });

    it('signal.aborted is true after abort', async () => {
      await browser.url(TESTPAGE_URL);
      const result = await browser.executeAsync(async (done) => {
        setTimeout(() => {
          done('FAIL');
        }, 2000);
        const controller = new AbortController();
        controller.signal.addEventListener('abort', () => {
          if (controller.signal.aborted === true) {
            done('PASS');
          } else {
            done('FAIL');
          }
        });
        controller.abort();
        if (controller.signal.aborted !== true) {
          done('FAIL');
        }
      });
      expect(result).toBe('PASS');
    });

    it('event listener doesn\'t fire "abort" event after removeEventListener', async () => {
      await browser.url(TESTPAGE_URL);
      const result = await browser.executeAsync(async (done) => {
        setTimeout(() => {
          done('PASS');
        }, 200);
        const controller = new AbortController();
        const handlerFunc = () => {
          done('FAIL');
        };
        controller.signal.addEventListener('abort', handlerFunc);
        controller.signal.removeEventListener('abort', handlerFunc);
        controller.abort();
      });
      expect(result).toBe('PASS');
    });

    it('signal.onabort called on abort', async () => {
      await browser.url(TESTPAGE_URL);
      const result = await browser.executeAsync(async (done) => {
        setTimeout(() => {
          done('FAIL');
        }, 200);
        const controller = new AbortController();
        controller.signal.onabort = () => {
          done('PASS');
        };
        controller.abort();
      });
      expect(result).toBe('PASS');
    });

    it('fetch from web worker works', async () => {
      // Need to load from webserver because worker because security policy
      // prevents file:// pages from "loading arbitrary .js files" as workers.
      const server = http
        .createServer((req, res) => {
          if (req.url === '/') {
            // No need to load polyfill in main JS context, we're only gonna run it
            // inside the worker only
            res.end('');
          } else if (req.url === '/umd-polyfill.js') {
            res.setHeader('Content-Type', 'text/javascript');
            res.end(fs.readFileSync(path.join(__dirname, '../dist/umd-polyfill.js')));
          } else if (req.url === '/web-worker.js') {
            res.setHeader('Content-Type', 'text/javascript');
            res.end(fs.readFileSync(path.join(__dirname, 'web-worker.js')));
          }
        })
        .listen(0);
      const boundListenPort = server.address().port;

      await browser.url(`http://127.0.0.1:${boundListenPort}`);
      const result = await browser.executeAsync(async (done) => {
        setTimeout(() => {
          done('FAIL');
        }, 2000);
        const worker = new Worker('web-worker.js');
        worker.postMessage('run-test');
        worker.onmessage = (ev) => {
          done(ev.data);
        };
      });
      expect(result).toBe('PASS');
      server.close();
    });

    it('toString() output', async () => {
      await browser.url(TESTPAGE_URL);

      let result;

      result = await browser.executeAsync((done) => {
        done(new AbortController().toString());
      });
      expect(result).toBe('[object AbortController]');

      result = await browser.executeAsync((done) => {
        done(Object.prototype.toString.call(new AbortController()));
      });
      expect(result).toBe('[object AbortController]');

      result = await browser.executeAsync((done) => {
        done(new AbortController().signal.toString());
      });
      expect(result).toBe('[object AbortSignal]');
    });

    it('abort(reason)', async () => {
      await browser.url(TESTPAGE_URL);
      const signalReason = await browser.executeAsync(async (done) => {
        const controller = new AbortController();
        controller.abort('My reason');

        done(controller.signal.reason);
      });
      expect(signalReason).toEqual('My reason');
    });

    it('AbortSignal.timeout(duration)', async () => {
      const { server, baseUrl } = createFetchTargetServer();
      await browser.url(TESTPAGE_URL);
      const err = await browser.executeAsync(async (baseUrl, done) => {
        setTimeout(() => {
          done({ name: 'fail' });
        }, 2000);
        const signal = AbortSignal.timeout(500);
        try {
          let request = new Request(`${baseUrl}?sleepMillis=1000`, { signal });
          await fetch(request);
        } catch (err) {
          done(err);
        }
      }, baseUrl);
      expect(err.name).toBe('AbortError');
      server.close();
    });
  });
};

// Run all testcases with abortcontroller-polyfill force installed (even browser has native AbortController)
runBasicTests(
  'basic tests with abortcontroller-polyfill force installed',
  `${TESTPAGE_URL_BASE}?__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL=1`
);

// Run all testcases again with normal installation logic for abortcontroller-polyfill (on modern browsers
// this will run the testcases against the native AbortController implementation, and on older browsers
// this will verify that the polyfill chooses to install itself when it is needed)
runBasicTests('basic tests again with normal installation logic for abortcontroller-polyfill', TESTPAGE_URL_BASE);

afterEach(() => {
  checkJSErrors();
});

let hasPrintErrorOnceAlready = false;
function checkJSErrors() {
  let browserLog = [];
  if (browser.capabilities.browserName === 'firefox') {
    if (!hasPrintErrorOnceAlready) {
      console.log('NOTE: cannot get browser log in firefox so cannot verify that "no JS errors" fired during testing');
      hasPrintErrorOnceAlready = true;
    }
  } else {
    browser.call(() =>
      browser.getLogs('browser').then((log) => {
        browserLog = log;
        browserLog.forEach((error) => {
          if (error.level === 'SEVERE') {
            console.log(chalk.red(`[${error.level}] ${error.message}`));
          } else {
            console.log(`[${error.level}] ${error.message}`);
          }
        });
      })
    );
  }
  return browserLog;
}
