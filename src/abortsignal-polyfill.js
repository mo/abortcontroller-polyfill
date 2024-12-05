import { abortsignalPonyfill, normalizeAbortReason, createAbortEvent } from "./abortsignal-ponyfill";
import { signalPolyfillNeeded } from "./utils";

(function (self) {
  'use strict';

  if (!signalPolyfillNeeded(self)) {
    return;
  }

  self.AbortSignal.abort = function abort(reason) {
    const ac = new AbortController()
    ac.abort(reason)
    return ac.signal
  }

  self.AbortSignal.any = function any(iterable) {
    const controller = new AbortController();
    /**
     * @this AbortSignal
     */
    function abort() {
      controller.abort(this.reason);
      clean();
    }
    function clean() {
      for (const signal of iterable) signal.removeEventListener('abort', abort);
    }
    for (const signal of iterable)
      if (signal.aborted) {
        controller.abort(signal.reason);
        break;
      } else signal.addEventListener('abort', abort);

    return controller.signal;
  }

  self.AbortSignal.timeout = function timeout(ms) {
    const controller = new AbortController();

    setTimeout(() => controller.abort(new DOMException(`This signal is timeout in ${time}ms`, 'TimeoutError')), time);

    return controller.signal;
  }

  const NativeAbortController = self.AbortController
  if (!NativeAbortController.__polyfill__) {
    self.AbortController = class AbortController extends NativeAbortController {
      constructor() {
        super()
        abortsignalPonyfill(this.signal)
      }

      static __polyfill__ = true

      abort(reason) {
        if (!this.signal.aborted) {
          super.abort(reason)

          if (this.signal.__ponyfill__) {
            const signalReason = normalizeAbortReason(reason)
            const event = createAbortEvent(signalReason)

            this.signal._reason = signalReason
            this.signal.dispatchEvent(event)
          }
        }
      }
    }
  }
})(typeof self !== 'undefined' ? self : global);
