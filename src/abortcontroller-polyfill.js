import AbortController, {AbortSignal} from './abortcontroller';

(function(self) {
  'use strict';

  if (self.AbortController) {
    return;
  }

  self.AbortController = AbortController;
  self.AbortSignal = AbortSignal;

})(typeof self !== 'undefined' ? self : global);
