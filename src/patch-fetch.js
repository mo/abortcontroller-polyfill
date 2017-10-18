
(function(self) {
  'use strict';
  
  if (!self.Request) return

  // Do feature detecting
  const controller = new AbortController();
  const signal = controller.signal;
  const request = new Request('/', { signal });

  if (request.signal) return // Already supports it (like FF v57 and fetch-polyfill)

  const realFetch = fetch;
  const abortableFetch = (input, init) => {
    if (init && init.signal) {
      let abortError;
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
      const cancellation = new Promise((_, reject) => {
        init.signal.addEventListener('abort', () => reject(abortError), {once: true});
      });

      delete init.signal;

      // Return the fastest promise (don't need to wait for request to finish)
      return Promise.race([cancellation, realFetch(input, init)]);
    }

    return realFetch(input, init);
  };

  self.fetch = abortableFetch;

})(typeof self !== 'undefined' ? self : this);
