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
  }

  class AbortController {
    constructor() {
      this.signal = new AbortSignal();
    }
    abort() {
      this.signal.aborted = true;
      this.signal.dispatchEvent(new Event('abort'));
    }
  }

  const realFetch = fetch;
  const abortableFetch = (input, init) => {
    if (init && init.signal) {
      const casting = () => new DOMException('Aborted', 'AbortError');

      // Return early if already aborted, doz avoiding making a request
      if (init.signal.aborted) {
        return Promise.reject(casting());
      }

      // Turn a event into a promise, reject it once `abort` is dispatched
      const cancable = new Promise((_, reject) => {
        // Do we have to remove the listener if request finish, to free memory?
        init.signal.addEventListener('abort', () => reject(casting()), {once: true});
      });

      delete init.signal;

      // Return the fastest promise (don't need to wait for request to finish)
      return Promise.race([cancable, realFetch(input, init)]);
    }

    return realFetch(input, init);
  };

  self.fetch = abortableFetch;
  self.AbortController = AbortController;

})(typeof self !== 'undefined' ? self : this);
