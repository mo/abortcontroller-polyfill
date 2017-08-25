(function(self) {
  'use strict';

  if (self.AbortController) {
    return;
  }

  class Emitter {
    constructor() {
      const delegate = document.createDocumentFragment();
      const methods = ['addEventListener', 'dispatchEvent', 'removeEventListener'];
      methods.forEach(method =>
        this[method] = (...args) => delegate[method](...args)
      );
    }
  }

  class AbortSignal extends Emitter {
    constructor() {
      super();

      this.aborted = false;
    }
    toString() {
      return '[object AbortSignal]';
    }
  }

  class AbortController {
    constructor() {
      this.signal = new AbortSignal();
    }
    abort() {
      this.signal.aborted = true;
      this.signal.dispatchEvent(new Event('abort'));
    }
    toString() {
      return '[object AbortController]';
    }
  }
  
  if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
    AbortController.prototype[Symbol.toStringTag] = 'AbortController'
    AbortSignal.prototype[Symbol.toStringTag] = 'AbortSignal'
  }

  const realFetch = fetch;
  const abortableFetch = (input, init) => {
    if (init && init.signal) {
      const abortError = new DOMException('Aborted', 'AbortError');

      // Return early if already aborted, thus avoiding making an HTTP request
      if (init.signal.aborted) {
        return Promise.reject(abortError);
      }

      // Turn an event into a promise, reject it once `abort` is dispatched
      const cancellation = new Promise((_, reject) => {
        init.signal.addEventListener('abort', () => reject(abortError), {once: true});
      });

      delete init.signal;

      // Return the fastest promise (don't need to wait for request to finish)
      return Promise.race([cancellation, realFetch(input, init)]);
    }

    return realFetch(input, init);
  };

  self.fetch = abortableFetch;
  self.AbortController = AbortController;

})(typeof self !== 'undefined' ? self : this);
