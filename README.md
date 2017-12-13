# AbortController "polyfill"

Minimal stubs so that the AbortController DOM API for terminating ```fetch()``` requests can be used
in browsers that doesn't yet implement it. This "polyfill" doesn't actually close the connection
when the request is aborted, but it calls ```.catch()``` with ```err.name == 'AbortError'``` instead
of ```.then()```.

```js
const controller = new AbortController();
const signal = controller.signal;
fetch('/some/url', {signal}).then(res => res.json()).then(data => {
  // do something with "data"
}).catch(err => {
  if (err.name == 'AbortError') {
    return;
  }
});
```

You can read about the [AbortController](https://dom.spec.whatwg.org/#aborting-ongoing-activities) API in the DOM specification.

# How to use

```shell
$ npm install --save abortcontroller-polyfill
```

If you're using webpack or similar, import it early in your client entrypoint .js file using
```import 'abortcontroller-polyfill'``` or ```require('abortcontroller-polyfill')```.

# Contributors
* [Martin Olsson](https://github.com/mo)
* [Jimmy Wärting](https://github.com/jimmywarting)
* [silverwind](https://github.com/silverwind)
* [Rasmus Jacobsen](https://github.com/rmja)

# See also

* [PR for fetch specification](https://github.com/whatwg/fetch/pull/523)

# License

MIT
