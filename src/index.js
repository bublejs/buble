import { parse } from 'acorn';
import Program from './program/Program.js';
import getSnippet from './utils/getSnippet.js';

export function transform ( source, options ) {
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

	return new Program( source, ast ).export( options );
}
