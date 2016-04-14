import { parse } from 'acorn/src/index.js';
import Program from './program/Program.js';
import { features, matrix } from './support.js';
import getSnippet from './utils/getSnippet.js';

export function target ( target ) {
	const targets = Object.keys( target );
	let bitmask = targets.length ? Math.pow( 2, 53 ) - 1 : 0;

	Object.keys( target ).forEach( environment => {
		const versions = matrix[ environment ];
		if ( !versions ) throw new Error( `Unknown environment '${environment}'. Please raise an issue at https://gitlab.com/Rich-Harris/buble/issues` );

		const targetVersion = target[ environment ];
		if ( !( targetVersion in versions ) ) throw new Error( `Support data exists for the following versions of ${environment}: ${Object.keys( versions ).join( ', ')}. Please raise an issue at https://gitlab.com/Rich-Harris/buble/issues` );
		const support = versions[ targetVersion ];

		bitmask &= support;
	});

	let transforms = Object.create( null );
	features.forEach( ( name, i ) => {
		transforms[ name ] = !( bitmask & 1 << i );
	});

	return transforms;
}

export function transform ( source, options = {} ) {
	let ast;

	try {
		ast = parse( source, {
			ecmaVersion: 6,
			preserveParens: true,
			sourceType: 'module'
		});
	} catch ( err ) {
		err.snippet = getSnippet( source, err.loc );
		throw err;
	}

	let transforms = target( options.target || {} );
	Object.keys( options.transforms || {} ).forEach( name => {
		if ( !( name in transforms ) ) throw new Error( `Unknown transform '${name}'` );
		transforms[ name ] = options.transforms[ name ];
	});

	return new Program( source, ast, transforms ).export( options );
}
