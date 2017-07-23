(function(self) {
  'use strict';

  if (self.AbortController) {
    return;
  }

  class AbortController {
    constructor() {
      this.signal = {};
    }
    abort() {
      if (this.signal.__internalOnCancel) {
        this.signal.__internalOnCancel();
      }
    }
  }
  const realFetch = fetch;
  const abortableFetch = (input, init) => {
    let isAborted = false;
    if (init && init.signal) {
      init.signal.__internalOnCancel = () => {
        isAborted = true;
      };
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
