# AbortController polyfill for abortable fetch()

[![npm version](https://badge.fury.io/js/abortcontroller-polyfill.svg)](https://badge.fury.io/js/abortcontroller-polyfill)

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
// controller.abort(); // can be called at any time
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

# Using it on Node.js

```js
const { AbortController, abortableFetch } = require('abortcontroller-polyfill/dist/abortcontroller');
const { fetch } = abortableFetch(require('node-fetch'));
// or
// import AbortController, { abortableFetch } from 'abortcontroller-polyfill/dist/abortcontroller';
// import _fetch from 'node-fetch';
// const { fetch } = abortableFetch(_fetch);
```
or if you're lazy
```js
global.fetch = require('node-fetch');
require('abortcontroller-polyfill');
```

If you also need a ```Request``` class with support for aborting you can do:

```js
const { AbortController, abortableFetch } = require('abortcontroller-polyfill/dist/abortcontroller');
const _nodeFetch = require('node-fetch');
const { fetch, Request } = abortableFetch({fetch: _nodeFetch, Request: _nodeFetch.Request});

const controller = new AbortController();
const signal = controller.signal;
controller.abort();
fetch(Request("http://api.github.com", {signal}))
  .then(r => r.json())
  .then(j => console.log(j))
  .catch(err => {
      if (err.name === 'AbortError') {
          console.log('aborted');
      }
  })
```

# Contributors
* [Martin Olsson](https://github.com/mo)
* [Jimmy Wärting](https://github.com/jimmywarting)
* [silverwind](https://github.com/silverwind)
* [Rasmus Jacobsen](https://github.com/rmja)
* [João Vieira](https://github.com/joaovieira)
* [Cyril Auburtin](https://github.com/caub)

# License

MIT
