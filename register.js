var fs = require( 'fs' );
var path = require( 'path' );
var buble = require( './' );

var original = require.extensions[ '.js' ];
var nodeModulesPattern = path.sep === '/' ? /\/node_modules\// : /\\node_modules\\/;

var nodeVersion = /(?:0\.)?\d+/.exec( process.version )[0];
var versions = [ '0.10', '0.12', '4', '5' ];

if ( !~versions.indexOf( nodeVersion ) ) {
	if ( +nodeVersion > 5 ) {
		nodeVersion = 5;
	} else {
		throw new Error( 'Unsupported version (' + nodeVersion + '). Please raise an issue at https://gitlab.com/Rich-Harris/buble/issues' );
	}
}

var options = {
	target: {
		node: nodeVersion
	}
};

require.extensions[ '.js' ] = function ( m, filename ) {
	if ( nodeModulesPattern.test( filename ) ) return original( m, filename );

	var source = fs.readFileSync( filename, 'utf-8' );
	var compiled = buble.transform( source, options );

	m._compile( '"use strict";\n' + compiled.code, filename );
};
