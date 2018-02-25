import AbortController, {AbortSignal} from './abortcontroller';
import abortableFetch from './abortableFetch';

(function(self) {
  'use strict';

  if (self.AbortController) {
    return;
  }

  self.AbortController = AbortController;
  self.AbortSignal = AbortSignal;

  if (!self.fetch) {
    console.warn('fetch() is not available, cannot install abortcontroller-polyfill');
    return;
  }

  const {fetch, Request} = abortableFetch(self);
  self.fetch = fetch;
  self.Request = Request;

})(typeof self !== 'undefined' ? self : global);
