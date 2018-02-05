# AbortController polyfill for abortable fetch()

Minimal stubs so that the AbortController DOM API for terminating ```fetch()``` requests can be used
in browsers that doesn't yet implement it. This "polyfill" doesn't actually close the connection
when the request is aborted, but it will call ```.catch()``` with ```err.name == 'AbortError'```
instead of ```.then()```.

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

If you're using webpack or similar, you then import it early in your client entrypoint .js file using

```js
import 'abortcontroller-polyfill'
```

or

```js
require('abortcontroller-polyfill')
```

## Using it along with 'create-react-app'

create-react-app enforces the no-undef eslint rule at compile time so if your
version of eslint does not list ```AbortController``` etc as a known global for
the ```browser``` environment, then you might run into an compile error like:

```
  'AbortController' is not defined  no-undef
```

This can be worked around by (temporarily, details [here](https://github.com/mo/abortcontroller-polyfill/issues/10)) adding a declaration like:

```js
  const AbortController = window.AbortController;
```

# Contributors
* [Martin Olsson](https://github.com/mo)
* [Jimmy Wärting](https://github.com/jimmywarting)
* [silverwind](https://github.com/silverwind)
* [Rasmus Jacobsen](https://github.com/rmja)
* [João Vieira](https://github.com/joaovieira)

# License

MIT
