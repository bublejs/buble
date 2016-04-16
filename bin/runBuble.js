var fs = require( 'fs' );
var path = require( 'path' );
var buble = require( '../' );
var handleError = require( './handleError.js' );

function compile ( src, dest, options ) {

}

function compileDir ( src, dest, options ) {

}

function compileFile ( src, dest, options ) {

}

module.exports = function ( command ) {
	if ( command._.length > 1 ) {
		handleError({ code: 'ONE_AT_A_TIME' });
	}

	if ( command._.length === 1 ) {
		if ( command.input ) {
			handleError({ code: 'DUPLICATE_IMPORT_OPTIONS' });
		}

		command.input = command._[0];
	}

	if ( !command.output && command.sourcemap === true ) {
		handleError({ code: 'MISSING_OUTPUT_FILE' });
	}

	var isDir;

	if ( command.input ) {
		try {
			var stats = fs.statSync( command.input );
			isDir = stats.isDirectory();
		} catch ( err ) {
			handleError({ code: 'FILE_DOES_NOT_EXIST' });
		}
	}

	if ( isDir ) {
		if ( !command.output ) {
			handleError({ code: 'MISSING_OUTPUT_DIR' });
		}

		throw new Error( 'TODO directories' );
	}

	else {
		var source = fs.readFileSync( command.input, 'utf-8' );

		try {
			var result = buble.transform( source, {
				source: command.input,
				file: command.output || null
			});
		} catch ( err ) {
			handleError( err );
		}

		if ( command.output ) {
			if ( command.sourcemap === 'inline' ) {
				result.code += '\n//# sourceMappingURL=' + result.map.toUrl();
			} else if ( command.sourcemap ) {
				result.code += '\n//# sourceMappingURL=' + path.basename( command.output ) + '.map';
				fs.writeFileSync( command.output + '.map', result.map.toString() );
			}

			fs.writeFileSync( command.output, result.code );
		} else {
			if ( command.sourcemap && command.sourcemap !== 'inline' ) {
				handleError({ code: 'MISSING_OUTPUT_FILE' });
			}

			console.log( result.code ); // eslint-disable-line no-console
		}
	}
};
