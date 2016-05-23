import Node from '../Node.js';
import spread, { isArguments } from '../../utils/spread.js';

export default class ArrayExpression extends Node {
	transpile ( code, transforms ) {
		if ( transforms.spreadRest ) {
			if ( this.elements.length === 1 ) {
				const element = this.elements[0];

				if ( element.type === 'SpreadElement' ) {
					// special case – [ ...arguments ]
					if ( isArguments( element.argument ) ) {
						code.overwrite( this.start, element.argument.start, 'Array.apply( null, ' );
					} else {
						code.overwrite( this.start, element.argument.start, '[].concat( ' );
					}

					code.overwrite( element.end, this.end, ' )' );
				}
			}

			else {
				const hasSpreadElements = spread( code, this.elements, this.start );

				if ( hasSpreadElements ) {
					code.overwrite( this.elements[ this.elements.length - 1 ].end, this.end, ' )' );
				}
			}
		}

		super.transpile( code, transforms );
	}
}
