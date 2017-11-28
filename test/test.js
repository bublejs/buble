var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var child_process = require('child_process');
var assert = require('assert');
var glob = require('glob');
var SourceMapConsumer = require('source-map').SourceMapConsumer;
var getLocation = require('./utils/getLocation.js');
var buble = require('../dist/buble.umd.js');

require('source-map-support').install();
require('console-group').install();

function equal(a, b) {
	assert.equal(showInvisibles(a), showInvisibles(b));
}

function showInvisibles(str) {
	return str
		.replace(/^ +/gm, spaces => repeat('•', spaces.length))
		.replace(/ +$/gm, spaces => repeat('•', spaces.length))
		.replace(/^\t+/gm, tabs => repeat('›   ', tabs.length))
		.replace(/\t+$/gm, tabs => repeat('›   ', tabs.length));
}

function repeat(str, times) {
	var result = '';
	while (times--) result += str;
	return result;
}

const subsetIndex = process.argv.indexOf('--subset');
const subset = ~subsetIndex
	? process.argv[subsetIndex + 1].split(',').map(file => `${file}.js`)
	: null;
const subsetFilter = subset ? file => ~subset.indexOf(file) : () => true;

describe('buble', () => {
	fs
		.readdirSync('test/samples')
		.filter(subsetFilter)
		.forEach(file => {
			if (!/\.js$/.test(file)) return; // avoid vim .js.swp files
			var samples = require('./samples/' + file);

			describe(path.basename(file), () => {
				samples.forEach(sample => {
					(sample.solo ? it.only : sample.skip ? it.skip : it)(
						sample.description,
						() => {
							if (sample.error) {
								assert.throws(() => {
									buble.transform(sample.input, sample.options);
								}, sample.error);
							} else {
								equal(
									buble.transform(sample.input, sample.options).code,
									sample.output
								);
							}
						}
					);
				});
			});
		});

	if (subset) return;

	describe('cli', () => {
		fs.readdirSync('test/cli').forEach(dir => {
			if (dir[0] === '.') return; // .DS_Store

			it(dir, done => {
				dir = path.resolve('test/cli', dir);
				rimraf.sync(path.resolve(dir, 'actual'));
				fs.mkdirSync(path.resolve(dir, 'actual'));

				var binFile = path.resolve(__dirname, '../bin/buble');
				var commandFile = path.resolve(dir, 'command.sh');

				var command = fs
					.readFileSync(commandFile, 'utf-8')
					.replace('buble', 'node "' + binFile + '"');
				child_process.exec(
					command,
					{
						cwd: dir
					},
					(err, stdout, stderr) => {
						if (err) return done(err);

						if (stdout) console.log(stdout);
						if (stderr) console.error(stderr);

						function catalogue(subdir) {
							subdir = path.resolve(dir, subdir);

							return glob
								.sync('**/*.js?(.map)', { cwd: subdir })
								.sort()
								.map(name => {
									var contents = fs
										.readFileSync(path.resolve(subdir, name), 'utf-8')
										.replace(/\r\n/g, '\n')
										.trim();

									if (path.extname(name) === '.map') {
										contents = JSON.parse(contents);
									}

									return { name, contents };
								});
						}

						var expected = catalogue('expected');
						var actual = catalogue('actual');

						try {
							assert.deepEqual(actual, expected);
							done();
						} catch (err) {
							done(err);
						}
					}
				);
			});
		});
	});

	describe('errors', () => {
		it('reports the location of a syntax error', () => {
			var source = `var 42 = nope;`;

			try {
				buble.transform(source);
			} catch (err) {
				assert.equal(err.name, 'SyntaxError');
				assert.deepEqual(err.loc, { line: 1, column: 4 });
				assert.equal(err.message, 'Unexpected token (1:4)');
				assert.equal(err.snippet, `1 : var 42 = nope;\n        ^`);
				assert.equal(
					err.toString(),
					`SyntaxError: Unexpected token (1:4)\n1 : var 42 = nope;\n        ^`
				);
			}
		});

		it('reports the location of a compile error', () => {
			var source = `const x = 1; x++;`;

			try {
				buble.transform(source);
			} catch (err) {
				assert.equal(err.name, 'CompileError');
				assert.equal(err.loc.line, 1);
				assert.equal(err.loc.column, 13);
				assert.equal(err.message, 'x is read-only (1:13)');
				assert.equal(
					err.snippet,
					`1 : const x = 1; x++;\n                 ^^^`
				);
				assert.equal(
					err.toString(),
					`CompileError: x is read-only (1:13)\n1 : const x = 1; x++;\n                 ^^^`
				);
			}
		});
	});

	describe('target', () => {
		it('determines necessary transforms for a target environment', () => {
			var transforms = buble.target({ chrome: 49 });

			assert.ok(transforms.moduleImport);
			assert.ok(!transforms.arrow);
		});

		it('returns lowest common denominator support info', () => {
			var transforms = buble.target({ chrome: 49, node: 5 });

			assert.ok(transforms.defaultParameter);
			assert.ok(!transforms.arrow);
		});

		it('falls back if nonexistent browser', () => {
			var transforms = buble.target({ nonexistent: 99, fallback: { node: 5 }});

			assert.ok(transforms.defaultParameter);
			assert.ok(!transforms.arrow);
		});

		it('uses nearest version if nonexistent version', () => {
			var transforms = buble.target({ chrome: 51 });
			assert.ok(transforms.exponentiation); // chrome 51

			var transforms = buble.target({ chrome: 99 });
			assert.ok(!transforms.exponentiation); // chrome 52

			var transforms = buble.target({ chrome: 99, fallback: { node: 5 } });
			assert.ok(!transforms.exponentiation); // chrome 52

			var transforms = buble.target({ chrome: 10, fallback: { node: 5 }});
			assert.ok(!transforms.arrow); // node 5
		});

		it('only applies necessary transforms', () => {
			var source = `
				const power = ( base, exponent = 2 ) => Math.pow( base, exponent );`;

			var result = buble.transform(source, {
				target: { chrome: 49, node: 5 }
			}).code;

			assert.equal(
				result,
				`
				const power = ( base, exponent ) => {
					if ( exponent === void 0 ) exponent = 2;

					return Math.pow( base, exponent );
				};`
			);
		});
	});

	describe('sourcemaps', () => {
		it('generates a valid sourcemap', () => {
			var map = buble.transform('').map;
			assert.equal(map.version, 3);
		});

		it('uses provided file and source', () => {
			var map = buble.transform('', {
				file: 'output.js',
				source: 'input.js'
			}).map;

			assert.equal(map.file, 'output.js');
			assert.deepEqual(map.sources, ['input.js']);
		});

		it('includes content by default', () => {
			var source = `let { x, y } = foo();`;
			var map = buble.transform(source).map;

			assert.deepEqual(map.sourcesContent, [source]);
		});

		it('excludes content if requested', () => {
			var source = `let { x, y } = foo();`;
			var map = buble.transform(source, {
				includeContent: false
			}).map;

			assert.deepEqual(map.sourcesContent, [null]);
		});

		it('locates original content', () => {
			var source = `const add = ( a, b ) => a + b;`;
			var result = buble.transform(source, {
				file: 'output.js',
				source: 'input.js'
			});

			var smc = new SourceMapConsumer(result.map);

			var location = getLocation(result.code, 'add');
			var expected = getLocation(source, 'add');

			var actual = smc.originalPositionFor(location);

			assert.deepEqual(actual, {
				line: expected.line,
				column: expected.column,
				source: 'input.js',
				name: null
			});

			location = getLocation(result.code, 'a +');
			expected = getLocation(source, 'a +');

			actual = smc.originalPositionFor(location);

			assert.deepEqual(actual, {
				line: expected.line,
				column: expected.column,
				source: 'input.js',
				name: null
			});
		});

		it('recovers names', () => {
			var source = `
				const foo = 1;
				if ( x ) {
					const foo = 2;
				}`;

			var result = buble.transform(source, {
				file: 'output.js',
				source: 'input.js'
			});
			var smc = new SourceMapConsumer(result.map);

			var location = getLocation(result.code, 'var');
			var actual = smc.originalPositionFor(location);

			assert.equal(actual.name, 'const');

			location = getLocation(result.code, 'var', location.char + 1);
			actual = smc.originalPositionFor(location);

			assert.equal(actual.name, 'const');

			location = getLocation(result.code, 'foo$1', location.char + 1);
			actual = smc.originalPositionFor(location);

			assert.equal(actual.name, 'foo');
		});

		it('handles moved content', () => {
			var source = `
				for ( let i = 0; i < 10; i += 1 ) {
					const square = i * i;
					setTimeout( function () {
						log( square );
					}, i * 100 );
				}`;

			var result = buble.transform(source, {
				file: 'output.js',
				source: 'input.js'
			});
			var smc = new SourceMapConsumer(result.map);

			var location = getLocation(result.code, 'i < 10');
			var expected = getLocation(source, 'i < 10');

			var actual = smc.originalPositionFor(location);

			assert.deepEqual(actual, {
				line: expected.line,
				column: expected.column,
				source: 'input.js',
				name: null
			});

			location = getLocation(result.code, 'setTimeout');
			expected = getLocation(source, 'setTimeout');

			actual = smc.originalPositionFor(location);

			assert.deepEqual(actual, {
				line: expected.line,
				column: expected.column,
				source: 'input.js',
				name: null
			});
		});
	});
});
