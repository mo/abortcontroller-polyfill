'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (self) {
  'use strict';

  if (self.AbortController) {
    return;
  }

  var AbortSignal = function () {
    function AbortSignal() {
      _classCallCheck(this, AbortSignal);

      this.aborted = false;
      this.listeners = [];
    }

    _createClass(AbortSignal, [{
      key: 'addEventListener',
      value: function addEventListener(which, callback) {
        if (which == 'abort') {
          if (this.aborted) {
            callback();
          } else {
            this.listeners.push(callback);
          }
        }
      }
    }]);

    return AbortSignal;
  }();

  var AbortController = function () {
    function AbortController() {
      _classCallCheck(this, AbortController);

      this.signal = new AbortSignal();
    }

    _createClass(AbortController, [{
      key: 'abort',
      value: function abort() {
        this.signal.aborted = true;
        this.signal.listeners.forEach(function (cb) {
          return cb();
        });
      }
    }]);

    return AbortController;
  }();

  var realFetch = fetch;
  var abortableFetch = function abortableFetch(input, init) {
    var isAborted = false;
    if (init && init.signal) {
      init.signal.addEventListener('abort', function () {
        isAborted = true;
      });
      delete init.signal;
    }
    return realFetch(input, init).then(function (r) {
      if (isAborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      return r;
    });
  };

  self.fetch = abortableFetch;
  self.AbortController = AbortController;
})(typeof self !== 'undefined' ? self : undefined);
