import Node from '../Node.js';

function normalise ( str, removeTrailingWhitespace ) {
	str = str
		.replace( /^\s+/gm, '' )    // remove leading whitespace
		.replace( /\s+\n\r?/gm, ' ' ); // replace newlines with spaces

	if ( removeTrailingWhitespace ) {
		str = str.replace( /\s+$/, '' );
	}

	// TODO prefer single quotes?
	return JSON.stringify( str );
}

export default class JSXElement extends Node {
	transpile ( code, transforms ) {
		super.transpile( code, transforms );

		const children = this.children.filter( child => {
			return child.type === 'JSXElement' || /\S/.test( child.value );
		});

		if ( children.length ) {
			let c = this.openingElement.end;

			let i;
			for ( i = 0; i < children.length; i += 1 ) {
				const child = children[i];

				const tail = code.original[ c ] === '\n' && child.type !== 'Literal' ? '' : ' ';
				code.insertLeft( c, `,${tail}` );

				if ( child.type === 'Literal' ) {
					const str = normalise( child.value, i === children.length - 1 );
					code.overwrite( child.start, child.end, str );
				}

				c = child.end;
			}
		}

		code.insertLeft( this.end, this.children.length && code.original[ this.end ] !== '\n' ? ` )` : `)` );
	}
}
