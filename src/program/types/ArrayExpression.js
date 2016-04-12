import Node from '../Node.js';

export default class ArrayExpression extends Node {
	transpile ( code ) {
		const lastElement = this.elements[ this.elements.length - 1 ];
		if ( lastElement && lastElement.type === 'SpreadElement' ) {
			const penultimateElement = this.elements[ this.elements.length - 2 ];

			if ( penultimateElement ) {
				code.overwrite( penultimateElement.end, lastElement.start, ` ].concat( ` );
			} else {
				code.insert( this.start + 1, `].concat(` );
			}

			code.remove( lastElement.start, lastElement.start + 3 );

			let charIndex = lastElement.end;
			while ( code.original[ charIndex ] !== ']' ) charIndex += 1;

			code.overwrite( charIndex, charIndex + 1, ')' );
		}

		super.transpile();
	}
}
