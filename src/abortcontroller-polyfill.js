import AbortController, {AbortSignal} from './abortcontroller';

(function(self) {
  'use strict';

  if (
    self.AbortController &&
    (!self.navigator || !self.navigator.userAgent.match(/version\/[\d|.]+ safari\/[\d|.]+$/i))
  ) {
    return;
  }

  self.AbortController = AbortController;
  self.AbortSignal = AbortSignal;

})(typeof self !== 'undefined' ? self : global);
