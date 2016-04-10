import { parse } from 'acorn';
import Program from './program/Program.js';

export function transform ( source, options ) {
	var ast = parse( source, {
		ecmaVersion: 6,
		preserveParens: true,
		sourceType: 'module'
	});

	var program = new Program( source, ast );

	return program.export( options );
}
