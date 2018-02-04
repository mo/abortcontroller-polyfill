(function(self) {
  'use strict';

  if (self.AbortController) {
    return;
  }

  class Emitter {
    constructor () {
      this.listeners = {};
    }
    addEventListener (type, callback) {
      if (!(type in this.listeners)) {
        this.listeners[type] = [];
      }
      this.listeners[type].push(callback);
    }
    removeEventListener (type, callback) {
      if (!(type in this.listeners)) {
        return;
      }
      const stack = this.listeners[type];
      for (let i = 0, l = stack.length; i < l; i++) {
        if (stack[i] === callback){
          stack.splice(i, 1);
          return;
        }
      }
    }
    dispatchEvent (event) {
      if (!(event.type in this.listeners)) {
        return;
      }
      const debounce = callback => {
        setTimeout(() => callback.call(this, event));
      };
      const stack = this.listeners[event.type];
      for (let i = 0, l = stack.length; i < l; i++) {
        debounce(stack[i]);
      }
      return !event.defaultPrevented;
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
