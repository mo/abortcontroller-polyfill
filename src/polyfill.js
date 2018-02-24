import AbortController, {AbortSignal} from './abortcontroller';
import abortableFetch from './abortableFetch';

(function(self) {
  'use strict';

  if (self.AbortController) {
    return;
  }

  if (!self.fetch) {
    console.warn('fetch() is not available, cannot install abortcontroller-polyfill');
    return;
  }

  self.AbortController = AbortController;
  self.AbortSignal = AbortSignal;
  const {fetch, Request} = abortableFetch(self);
  self.fetch = fetch;
  self.Request = Request;

})(typeof self !== 'undefined' ? self : global);
