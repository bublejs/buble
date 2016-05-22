import Node from '../Node.js';

export default class ArrayExpression extends Node {
	transpile ( code, transforms ) {
		if ( transforms.spreadRest ) {
			const lastElement = this.elements[ this.elements.length - 1 ];
			if ( lastElement && lastElement.type === 'SpreadElement' ) {
				const penultimateElement = this.elements[ this.elements.length - 2 ];
				const argument = lastElement.argument;

				code.insertLeft( this.end, '.concat(' );
				code.move( argument.start, argument.end, this.end );
				code.insertRight( this.end, ')' );

				if ( penultimateElement ) {
					code.remove( penultimateElement.end, argument.start );
				} else {
					code.remove( this.start + 1, this.end - 1 );
				}
			}
		}

		super.transpile( code, transforms );
	}
}
