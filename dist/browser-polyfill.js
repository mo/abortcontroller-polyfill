'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (self) {
  'use strict';

  if (self.AbortController) {
    return;
  }

  var Emitter = function Emitter() {
    var _this = this;

    _classCallCheck(this, Emitter);

    var delegate = document.createDocumentFragment();
    var methods = ['addEventListener', 'dispatchEvent', 'removeEventListener'];
    methods.forEach(function (method) {
      return _this[method] = function () {
        return delegate[method].apply(delegate, arguments);
      };
    });
  };

  var AbortSignal = function (_Emitter) {
    _inherits(AbortSignal, _Emitter);

    function AbortSignal() {
      _classCallCheck(this, AbortSignal);

      var _this2 = _possibleConstructorReturn(this, (AbortSignal.__proto__ || Object.getPrototypeOf(AbortSignal)).call(this));

      _this2.aborted = false;
      return _this2;
    }

    _createClass(AbortSignal, [{
      key: 'toString',
      value: function toString() {
        return '[object AbortSignal]';
      }
    }]);

    return AbortSignal;
  }(Emitter);

  var AbortController = function () {
    function AbortController() {
      _classCallCheck(this, AbortController);

      this.signal = new AbortSignal();
    }

    _createClass(AbortController, [{
      key: 'abort',
      value: function abort() {
        this.signal.aborted = true;
        try {
          this.signal.dispatchEvent(new Event('abort'));
        } catch (e) {
          // For Internet Explorer 11:
          var event = document.createEvent('Event');
          event.initEvent('abort', false, true);
          this.signal.dispatchEvent(event);
        }
      }
    }, {
      key: 'toString',
      value: function toString() {
        return '[object AbortController]';
      }
    }]);

    return AbortController;
  }();

  if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    // These are necessary to make sure that we get correct output for:
    // Object.prototype.toString.call(new AbortController())
    AbortController.prototype[Symbol.toStringTag] = 'AbortController';
    AbortSignal.prototype[Symbol.toStringTag] = 'AbortSignal';
  }

  self.AbortController = AbortController;
  self.AbortSignal = AbortSignal;
})(typeof self !== 'undefined' ? self : undefined);'use strict';

(function (self) {
  'use strict';

  if (!self.fetch) {
    console.warn('fetch() is not available, cannot install abortcontroller-polyfill');
    return;
  }

  // Note that the "unfetch" minimal fetch polyfill defines fetch() without
  // defining window.Request, and this polyfill need to work on top of unfetch
  // so the below feature detection is wrapped in "if (self.Request) { ... }".
  if (self.Request) {
    // Do feature detecting
    var controller = new AbortController();
    var signal = controller.signal;
    var request = new Request('/', { signal: signal });

    // Browser already supports abortable fetch (like FF v57 and fetch-polyfill)
    if (request.signal) {
      return;
    }
  }

  var realFetch = fetch;
  var abortableFetch = function abortableFetch(input, init) {
    if (init && init.signal) {
      var abortError = void 0;
      try {
        abortError = new DOMException('Aborted', 'AbortError');
      } catch (err) {
        // IE 11 does not support calling the DOMException constructor, use a
        // regular error object on it instead.
        abortError = new Error('Aborted');
        abortError.name = 'AbortError';
      }

      // Return early if already aborted, thus avoiding making an HTTP request
      if (init.signal.aborted) {
        return Promise.reject(abortError);
      }

      // Turn an event into a promise, reject it once `abort` is dispatched
      var cancellation = new Promise(function (_, reject) {
        init.signal.addEventListener('abort', function () {
          return reject(abortError);
        }, { once: true });
      });

      // Return the fastest promise (don't need to wait for request to finish)
      return Promise.race([cancellation, realFetch(input, init)]);
    }

    return realFetch(input, init);
  };

  self.fetch = abortableFetch;
})(typeof self !== 'undefined' ? self : undefined);