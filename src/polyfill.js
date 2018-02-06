import {AbortController, AbortSignal} from './abortcontroller';
import patchFetch from './patch-fetch';

(function(self) {
  'use strict';

  if (self.AbortController) {
    return;
  }

  self.AbortController = AbortController;
  self.AbortSignal = AbortSignal;

  patchFetch(self);

})(typeof self !== 'undefined' ? self : this);
