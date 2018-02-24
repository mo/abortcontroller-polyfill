importScripts('umd-polyfill.js');

onmessage = function(ev) {
  setTimeout(() => {
    postMessage('FAIL');
  }, 2000);
  const controller = new AbortController();
  const signal = controller.signal;
  setTimeout(() => {
    controller.abort();
  }, 500);
  fetch('http://httpstat.us/200?sleep=1000', {signal})
    .then(r => postMessage('FAIL'))
    .catch(err => {
      if (err.name === 'AbortError') {
        postMessage('PASS');
      } else {
        postMessage('FAIL');
      }
    });
};