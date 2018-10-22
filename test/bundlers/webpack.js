const assert = require('assert');
const webpack = require('webpack');

webpack({ entry: "./index.js", mode: "none" }, (err, stats) => {
  assert(!stats.hasErrors())
  assert.deepStrictEqual(stats.compilation.warnings, [])
});
