/**
 * Make the native AbortSignal instances support the reason property and the throwIfAborted method.
 * @param {AbortSignal} signal native AbortSignal instance
 * @returns {AbortSignal} AbortSignal instance
 */
export function abortsignalPonyfill(signal) {
  if (!('reason' in signal)) {
    signal._reason = undefined
    signal._onabort = null

    Object.defineProperties(signal, {
      __ponyfill__: {
        value: true,
      },

      reason: {
        get() {
          return this._reason
        }
      },

      onabort: {
        get() {
          return this._onabort
        },
        set(callback) {
          const existing = this._onabort
          if (existing) {
            this.removeEventListener('abort', existing)
          }
          this._onabort = callback
          this.addEventListener('abort', callback)
        }
      }
    })

    const { dispatchEvent, addEventListener, removeEventListener } = signal

    signal.addEventListener = function (type, callback, options) {
      if (type === 'abort' && callback && this.__ponyfill__) {
        if (!callback.__ponyfill__) {
          const rawCallback = callback
          Object.defineProperty(callback, '__ponyfill__', {
            value(e) {
              if (e.__ponyfill__) {
                return rawCallback.call(this, e)
              }
            }
          })
        }
        callback = callback.__ponyfill__
      }
      return addEventListener.call(this, type, callback, options)
    }

    signal.removeEventListener = function (type, callback, options) {
      if (type === 'abort' && callback && this.__ponyfill__ && callback.__ponyfill__) {
        callback = callback.__ponyfill__
      }
      return removeEventListener.call(this, type, callback, options)
    }

    signal.dispatchEvent = function (event) {
      if (event.type === 'abort') {
        Object.defineProperty(event, '__ponyfill__', {
          value: true,
        })
      }
      return dispatchEvent.call(this, event)
    }
  }

  if (!('throwIfAborted') in signal) {
    signal.throwIfAborted = function throwIfAborted() {
      if (this.aborted) {
        throw this.reason
      }
    }
  }

  return signal
}

/**
 * @param {any} reason abort reason
 */
export function createAbortEvent(reason) {
  let event;
  try {
    event = new Event('abort');
  } catch (e) {
    if (typeof document !== 'undefined') {
      if (!document.createEvent) {
        // For Internet Explorer 8:
        event = document.createEventObject();
        event.type = 'abort';
      } else {
        // For Internet Explorer 11:
        event = document.createEvent('Event');
        event.initEvent('abort', false, false);
      }
    } else {
      // Fallback where document isn't available:
      event = {
        type: 'abort',
        bubbles: false,
        cancelable: false,
      };
    }
  }
  event.reason = reason
  return event
}

/**
 * @param {any} reason abort reason
 */
export function normalizeAbortReason(reason) {
  if (reason === undefined) {
    if (typeof document === 'undefined') {
      reason = new Error('This operation was aborted');
      reason.name = 'AbortError';
    } else {
      try {
        reason = new DOMException('signal is aborted without reason');
        reason.name = 'AbortError';
      } catch (err) {
        // IE 11 does not support calling the DOMException constructor, use a
        // regular error object on it instead.
        reason = new Error('This operation was aborted');
        reason.name = 'AbortError';
      }
    }
  }
  return reason
}
