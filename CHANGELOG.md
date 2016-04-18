# buble changelog

## 0.5.4

* Install missing `chalk` dependency
* Informative error messages when `buble/register` fails

## 0.5.3

* Add `register.js` to package. Yes I'm an idiot

## 0.5.2

* Add `buble/register` for use with e.g. Mocha

## 0.5.1

* Remove unused dependency

## 0.5.0

* Support `--target`, `--yes` and `--no` in CLI
* Compile entire directory of files via CLI
* Sourcemap support in CLI
* All transforms can be disabled (or errors suppressed) with the `transforms` option (or `--yes` and `--no`, in the CLI)
* `import` and `export` will throw an error unless `--no modules` transform is specified
* Fix bug with destructuring
* Fix bug with block scoping and loops


## 0.4.24

* Throw if `let`/`const` is redeclared, or `var` is redeclared with a `let`/`const` (0.4.22 regression)

## 0.4.23

* Add `buble.VERSION`
* Tidy up build process (don't bundle Acorn incorrectly)

## 0.4.22

* Allow double `var` declarations (only throw if `let` or `const` is redeclared)

## 0.4.21

* Add `find` and `findIndex` helpers for 0.12 support

## 0.4.20

* Bump to resolve unknown npm issue

## 0.4.19

* Fix block scoping bug with for loops that don't need to be rewritten as functions

## 0.4.18

* Fix break-inside-switch bug

## 0.4.17

* Support `for...in` loops and block scoping

## 0.4.16

* Add `ie` and `edge` to support matrix

## 0.4.15

* Rewrite reserved properties if specified ([#9](https://gitlab.com/Rich-Harris/buble/issues/9))

## 0.4.14

* Allow classes to extend expressions ([#15](https://gitlab.com/Rich-Harris/buble/issues/15))
* Experimental (partially implemented) API for disabling transforms based on target environment or custom requirements

## 0.4.13

* Fix return statement bug

## 0.4.12

* More complete and robust transpilation of loops that need to be rewritten as functions to simulate block scoping ([#11](https://gitlab.com/Rich-Harris/buble/issues/11), [#12](https://gitlab.com/Rich-Harris/buble/issues/12), [#13](https://gitlab.com/Rich-Harris/buble/issues/13))

## 0.4.11

* Remove source-map-support from CLI (only useful during development)

## 0.4.10

* Basic support for spread operator

## 0.4.9

* Support getters and setters on subclasses
* Disallow unsupported features e.g. generators

## 0.4.8

* Support getters and setters on classes
* Allow identifiers to be renamed in block-scoped destructuring ([#8](https://gitlab.com/Rich-Harris/buble/issues/8))
* Transpile body-less arrow functions correctly ([#9](https://gitlab.com/Rich-Harris/buble/issues/4))

## 0.4.7

* Add browser version

## 0.4.6

* Report locations of parse/compile errors ([#4](https://gitlab.com/Rich-Harris/buble/issues/4))

## 0.4.5

* Sourcemap support

## 0.4.4

* Support for class expressions
* More robust deconflicting
* Various bugfixes

## 0.4.3

* Handle arbitrary whitespace inside template literals

## 0.4.2

* Fix bug-inducing typo

## 0.4.1

* Rest parameters

## 0.4.0

* Self-hosting!

## 0.3.4

* Class inheritance

## 0.3.3

* Handle quote marks in template literals

## 0.3.2

* Handle empty `class` declarations

## 0.3.1

* Add `bin` to package

## 0.3.0

* (Very) basic CLI
* Handle `export default class ...`

## 0.2.2

* Initialise children of Property nodes
* Prevent false positives with reference detection

## 0.2.1

* Add missing files

## 0.2.0

* Support for a bunch more ES2015 features

## 0.1.0

* First (experimental) release
