# Bublé JSX Only

A fork of [Bublé](https://github.com/bublejs/buble) that only transforms JSX.

Why? To transpile JSX in the browser, using a Rollup plugin, with a minimal footprint. Bublé itself does an excellent job of this, however its bundle size is rather large. Most of the library deals with ES6 transformations, which we don't need. The premise of this library is to remove all that unnecessary code, so we end up with a minimal library that does JSX transformations.

How? Forked Bublé (as of July 2021), removed all tests except those for JSX, and used [Istanbul](https://istanbul.js.org/) to detect which code was not covered by the tests. Manually removed each piece of code not required for JSX transforms.

Details:

 * [Bublé issue: JSX Only?](https://github.com/bublejs/buble/issues/213)
 * [Pull Request with the changes](https://github.com/datavis-tech/buble-jsx-only/pull/3)
