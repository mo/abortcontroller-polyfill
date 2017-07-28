(function(self) {
  'use strict';

  if (self.AbortController) {
    return;
  }
  
  class Emitter {
    constructor() {
      var delegate = document.createDocumentFragment();
      var methods = ['addEventListener', 'dispatchEvent', 'removeEventListener'];
      methods.forEach(f =>
        this[f] = (...xs) => delegate[f](...xs)
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
