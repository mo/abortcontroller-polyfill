(function(self) {
  'use strict';

  if (self.AbortController) {
    return;
  }

  class AbortSignal {
    constructor() {
      this.aborted = false;
      this.listeners = [];
    }
    addEventListener(which, callback) {
      if (which == 'abort') {
        if (this.aborted) {
          callback();
        } else {
          this.listeners.push(callback);
        }
      }
    }
  }

  class AbortController {
    constructor() {
      this.signal = new AbortSignal();
    }
    abort() {
      this.signal.aborted = true;
      this.signal.listeners.forEach(cb => cb());
    }
  }

  const realFetch = fetch;
  const abortableFetch = (input, init) => {
    let isAborted = false;
    if (init && init.signal) {
      init.signal.addEventListener('abort', () => {
        isAborted = true;
      });
      delete init.signal;
    }
    return realFetch(input, init).then(r => {
      if (isAborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      return r;
    });
  };

  self.fetch = abortableFetch;
  self.AbortController = AbortController;

})(typeof self !== 'undefined' ? self : this);
