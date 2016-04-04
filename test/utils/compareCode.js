function deepEqual ( a, b ) {
	if ( a !== a && b !== b ) return true; // NaN
	if ( a === null && b === null ) return true;

	var i;

	if ( Array.isArray( a ) ) {
		if ( !Array.isArray( b ) ) return false;

		i = a.length;
		if ( b.length !== i ) return false;

		while ( i-- ) if ( !deepEqual( a[i], b[i] ) ) return false;
		return true;
	}

	if ( typeof a === 'object' ) {
		if ( typeof b !== 'object' ) return false;

		var keys = Object.keys( a );

		i = keys.length;

		if ( Object.keys( b ).length !== i ) return false;

		while ( i-- ) {
			var key = keys[i];
			if ( key === 'start' || key === 'end' ) continue;
			if ( !deepEqual( a[ key ], b[ key ] ) ) return false;
		}

		return true;
	}

	return a === b;
}

module.exports = function compareCode ( a, b ) {
	var asts = {};

	console.log( 'Actual:' );
	console.log( a );

	console.log( 'Expected:' );
	console.log( b );

	try {
		asts.a = acorn.parse( a, { ecmaVersion: 6 });
	} catch ( err ) {
		asts.a = { 'a': 'fail' };
	}

	try {
		asts.b = acorn.parse( b, { ecmaVersion: 6 });
	} catch ( err ) {
		asts.b = { 'b': 'fail' };
	}

	var pass = deepEqual( asts.a, asts.b );

	assert.ok( pass, `Programs differ.\nActual:\n${a}\n\nExpected:\n${b}` );
}
