# Maintenance status

Bublé was created when ES2015 was still the future. Nowadays, all modern browsers support all of ES2015 and (in some cases) beyond. Unless you need to support IE11, you probably don't need to use Bublé to convert your code to ES5.

Since IE11 is an unfortunate reality for some people, we will continue to release bugfixes, but new features won't be added unless in exceptional circumstances.

---

# Bublé

## The blazing fast, batteries-included ES2015 compiler

* Try it out at [buble.surge.sh](https://buble.surge.sh)
* Read the docs at [buble.surge.sh/guide](https://buble.surge.sh/guide)


## Quickstart

Via the command line...

```bash
npm install -g buble
buble input.js > output.js
```

...or via the JavaScript API:

```js
var buble = require( 'buble' );
var result = buble.transform( source ); // { code: ..., map: ... }
```


## License

MIT
