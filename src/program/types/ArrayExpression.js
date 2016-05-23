import Node from '../Node.js';
import spread from '../../utils/spread.js';

export default class ArrayExpression extends Node {
	transpile ( code, transforms ) {
		if ( transforms.spreadRest ) {
			spread( code, this.elements, this.start, this.end );
		}

		super.transpile( code, transforms );
	}
}
