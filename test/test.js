var path = require( 'path' );
var fs = require( 'fs' );
var assert = require( 'assert' );
var SourceMapConsumer = require( 'source-map' ).SourceMapConsumer;
var getLocation = require( './utils/getLocation.js' );
var buble = require( '../dist/buble.umd.js' );

require( 'source-map-support' ).install();

function equal ( a, b ) {
	assert.equal( showInvisibles( a ), showInvisibles( b ) );
}

function showInvisibles ( str ) {
	return str
		.replace( /^ +/gm, spaces => repeat( '•', spaces.length ) )
		.replace( / +$/gm, spaces => repeat( '•', spaces.length ) )
		.replace( /^\t+/gm, tabs => repeat( '›   ', tabs.length ) )
		.replace( /\t+$/gm, tabs => repeat( '›   ', tabs.length ) );
}

function repeat ( str, times ) {
	var result = '';
	while ( times-- ) result += str;
	return result;
}

describe( 'buble', () => {
	fs.readdirSync( 'test/samples' ).forEach( file => {
		var samples = require( './samples/' + file );

		describe( path.basename( file ), () => {
			samples.forEach( sample => {
				( sample.solo ? it.only : sample.skip ? it.skip : it )( sample.description, () => {
					if ( sample.error ) {
						assert.throws( () => {
							buble.transform( sample.input );
						}, sample.error );
					}

					else {
						equal( buble.transform( sample.input ).code, sample.output );
					}
				});
			});
		});
	});

	describe( 'errors', () => {
		it( 'reports the location of a syntax error', () => {
			var source = `var 42 = nope;`;

			try {
				buble.transform( source );
			} catch ( err ) {
				assert.equal( err.name, 'SyntaxError' );
				assert.deepEqual( err.loc, { line: 1, column: 4 });
				assert.equal( err.message, 'Unexpected token (1:4)' );
				assert.equal( err.snippet, `1 : var 42 = nope;\n        ^` );
			}
		});

		it( 'reports the location of a compile error', () => {
			var source = `const x = 1; x++;`;

			try {
				buble.transform( source );
			} catch ( err ) {
				assert.equal( err.name, 'CompileError' );
				assert.equal( err.loc.line, 1 );
				assert.equal( err.loc.column, 13 );
				assert.equal( err.message, 'x is read-only (1:13)' );
				assert.equal( err.snippet, `1 : const x = 1; x++;\n                 ^^^` );
			}
		});
	});

	describe( 'sourcemaps', () => {
		it( 'generates a valid sourcemap', () => {
			var map = buble.transform( '' ).map;
			assert.equal( map.version, 3 );
		});

		it( 'uses provided file and source', () => {
			var map = buble.transform( '', {
				file: 'output.js',
				source: 'input.js'
			}).map;

			assert.equal( map.file, 'output.js' );
			assert.deepEqual( map.sources, [ 'input.js' ] );
		});

		it( 'includes content by default', () => {
			var source = `let { x, y } = foo();`;
			var map = buble.transform( source ).map;

			assert.deepEqual( map.sourcesContent, [ source ] );
		});

		it( 'excludes content if requested', () => {
			var source = `let { x, y } = foo();`;
			var map = buble.transform( source, {
				includeContent: false
			}).map;

			assert.deepEqual( map.sourcesContent, [ null ] );
		});

		it( 'locates original content', () => {
			var source = `const add = ( a, b ) => a + b;`;
			var result = buble.transform( source, {
				file: 'output.js',
				source: 'input.js'
			});

			var smc = new SourceMapConsumer( result.map );

			var location = getLocation( result.code, 'add' );
			var expected = getLocation( source, 'add' );

			var actual = smc.originalPositionFor( location );

			assert.deepEqual( actual, {
				line: expected.line,
				column: expected.column,
				source: 'input.js',
				name: null
			});

			location = getLocation( result.code, 'a +' );
			expected = getLocation( source, 'a +' );

			actual = smc.originalPositionFor( location );

			assert.deepEqual( actual, {
				line: expected.line,
				column: expected.column,
				source: 'input.js',
				name: null
			});
		});

		it( 'recovers names', () => {
			var source = `
				const foo = 1;
				if ( x ) {
					const foo = 2;
				}`;

			var result = buble.transform( source, {
				file: 'output.js',
				source: 'input.js'
			});
			var smc = new SourceMapConsumer( result.map );

			var location = getLocation( result.code, 'var' );
			var actual = smc.originalPositionFor( location );

			assert.equal( actual.name, 'const' );

			location = getLocation( result.code, 'var', location.char + 1 );
			actual = smc.originalPositionFor( location );

			assert.equal( actual.name, 'const' );

			location = getLocation( result.code, 'foo$1', location.char + 1 );
			actual = smc.originalPositionFor( location );

			assert.equal( actual.name, 'foo' );
		});

		it( 'handles moved content', () => {
			var source = `
				for ( let i = 0; i < 10; i += 1 ) {
					const square = i * i;
					setTimeout( function () {
						log( square );
					}, i * 100 );
				}`;

			var result = buble.transform( source, {
				file: 'output.js',
				source: 'input.js'
			});
			var smc = new SourceMapConsumer( result.map );

			var location = getLocation( result.code, 'i < 10' );
			var expected = getLocation( source, 'i < 10' );

			var actual = smc.originalPositionFor( location );

			assert.deepEqual( actual, {
				line: expected.line,
				column: expected.column,
				source: 'input.js',
				name: null
			});

			location = getLocation( result.code, 'setTimeout' );
			expected = getLocation( source, 'setTimeout' );

			actual = smc.originalPositionFor( location );

			assert.deepEqual( actual, {
				line: expected.line,
				column: expected.column,
				source: 'input.js',
				name: null
			});
		});
	});
});
