import AbortController, {AbortSignal, abortableFetch} from './abortcontroller';

(function(self) {
  'use strict';

  if (self.AbortController) {
    return;
  }

  self.AbortController = AbortController;
  self.AbortSignal = AbortSignal;
  const {fetch, Request} = abortableFetch(self);
  self.fetch = fetch;
  self.Request = Request;

})(typeof self !== 'undefined' ? self : this);
