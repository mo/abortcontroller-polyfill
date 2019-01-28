import AbortController, {AbortSignal} from './abortcontroller';
import abortableFetch from './abortableFetch';
import {nativeAbortControllerIsBroken} from './utils';

(function(self) {
  'use strict';

  if (self.AbortController && !nativeAbortControllerIsBroken(self)) {
    return;
  }

  Object.defineProperty(self, 'AbortController', {
    writable: true,
    enumerable: false,
    configurable: true,
    value: AbortController
  });

  Object.defineProperty(self, 'AbortSignal', {
    writable: true,
    enumerable: false,
    configurable: true,
    value: AbortSignal
  });

  if (!self.fetch) {
    console.warn('fetch() is not available, cannot install abortcontroller-polyfill');
    return;
  }

  const {fetch, Request} = abortableFetch(self);
  self.fetch = fetch;
  self.Request = Request;

})(typeof self !== 'undefined' ? self : global);
