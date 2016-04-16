Bublé version <%= version %>
=====================================

Usage: buble [options] <entry file>

Basic options:

-v, --version            Show version number
-h, --help               Show this help message
-i, --input              Input (alternative to <entry file>)
-o, --output <output>    Output (if absent, prints to stdout)
-m, --sourcemap          Generate sourcemap (`-m inline` for inline map)
-t, --target             Select compilation targets
-y, --yes                Transforms to always apply (overrides --target)
-n, --no                 Transforms to always skip (overrides --target)

Examples:

buble input.js > output.js
buble input.js -o output.js -m
buble input.js -o output.js -m inline
buble input.js -o output.js -t firefox:43,node:5

Notes:

* When piping to stdout, only inline sourcemaps are permitted

For more information visit http://buble.surge.sh/guide
