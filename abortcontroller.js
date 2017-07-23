(function(self) {
  'use strict';

  class FetchController {
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
        throw { name: 'AbortError' };
      }
      return r;
    });
  };

  self.fetch = abortableFetch;
  self.FetchController = FetchController;

})(typeof self !== 'undefined' ? self : this);
