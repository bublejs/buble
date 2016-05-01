# Bublé

The blazing fast, batteries-included ES2015 compiler. [Try it out at buble.surge.sh](http://buble.surge.sh)

![derp](bublé.gif)


## Is this a Babel rip-off?

Yes – insofar as it's a tool that can transform ES2015 into JavaScript that will run today. The key differences:

* Bublé limits itself to ES2015 that can be transpiled to compact, performant ES5
* There are no plugins or presets – less extensibility, but also zero configuration
* It's comparatively tiny and many times faster

Unlike Babel, 100% spec compliance isn't an over-riding goal – for example it won't add runtime checks to ensure that you're not instantiating classes without `new`. (Complete spec compliance is impossible anyway, as some ES2015 features can't be transpiled.) You'll also need to bring your own polyfill (e.g. [es6-shim](https://github.com/es-shims/es6-shim)). **You have been warned!**


## How do I use it?

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


## What's supported?

Currently:

* Arrow functions
* Classes (with caveats – see below)
* Object shorthand methods and properties
* Template strings (untagged only – see below)
* Object and array destructuring
* Default parameters
* Block scoping (`let` and `const`)
* Binary and octal literals


## What's not supported?

Bublé only transpiles *language features* – it doesn't attempt to shim or polyfill the environment. If you want to use things like `array.findIndex(...)` or `'x'.repeat(3)` you'll have to bring your own polyfill.

It also refuses to transpile things that result in ES5 code with size or performance hazards (subject to change! It might support some of these features in future), or which are altogether impossible to transpile to ES5.

* Computed properties of objects and classes
* Tagged template strings
* Iterators
* Generators
* Regex unicode flag
* Modules (pssst... use [Rollup](http://rollupjs.org)!)
* `Map`, `Set`, `WeakMap`, `WeakSet`, `Proxy`, `Symbol`
* Tail call optimisation
* Compound destructuring


## Caveats

* Bublé assumes you're using the `class` keyword correctly – it doesn't stop you from instantiating a class without `new`, for example, and doesn't quite adhere to the spec as regards enumerability of methods, etc. Think of Babel's 'loose' mode, except looser.


## Is it finished?

Hell no. Still to come:

* More tests, especially for sourcemap support
* Errors for all unsupported features
* A better CLI
* Equivalents of `babel-node` and `babel-register`
* An API for controlling what gets transpiled, based on target environment

Please send in your bug reports and pull requests.


## Why not just use Babel?

I love Babel: it's an amazing project that has changed how the world writes JavaScript, and I'm in awe of the people who created and maintain it. But it adds overhead and configuration complexity, and so it's not the right tool for every project. Personally, I became frustrated at how much longer my builds took when Babel got involved, and the amount of time it would take to set it up with new projects.

Bublé is an ES2015 compiler that I built to serve *my* needs and opinions – a no-frills, easy-to-use tool that handles the subset of ES2015 that I actually use (which excludes `for...of`, generators, and other things that don't transpile well). It doesn't attempt to boil the ocean. If you share my needs and opinions, you will prefer Bublé; if you don't, you should continue to use Babel, which is more complete, more mature, and better supported.

## License

MIT
