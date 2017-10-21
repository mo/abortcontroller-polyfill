(function(self) {
  'use strict';

  if (self.AbortController) {
    return;
  }

  class Emitter {
    constructor() {
      const delegate = document.createDocumentFragment();
      const methods = ['addEventListener', 'dispatchEvent', 'removeEventListener'];
      methods.forEach(method =>
        this[method] = (...args) => delegate[method](...args)
      );
    }
  }

  class AbortSignal extends Emitter {
    constructor() {
      super();

      this.aborted = false;
    }
    toString() {
      return '[object AbortSignal]';
    }
  }

  class AbortController {
    constructor() {
      this.signal = new AbortSignal();
    }
    abort() {
      this.signal.aborted = true;
      try {
        this.signal.dispatchEvent(new Event('abort'));
      } catch (e) {
        // For Internet Explorer 11:
        const event = document.createEvent('Event');
        event.initEvent('abort', false, true);
        this.signal.dispatchEvent(event);
      }
    }
    toString() {
      return '[object AbortController]';
    }
  }

  if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    // These are necessary to make sure that we get correct output for:
    // Object.prototype.toString.call(new AbortController())
    AbortController.prototype[Symbol.toStringTag] = 'AbortController';
    AbortSignal.prototype[Symbol.toStringTag] = 'AbortSignal';
  }

  self.AbortController = AbortController;
  self.AbortSignal = AbortSignal;

})(typeof self !== 'undefined' ? self : this);
