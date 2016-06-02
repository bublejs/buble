import Node from '../Node.js';
import reserved from '../../utils/reserved.js';

export default class AwaitExpression extends Node {
	transpile ( code, transforms ) {
		if ( transforms.asyncAwait ) {
			// remove await keyword
			code.remove( this.start, this.start + 6 );
			// return the awaited expression
			code.insertLeft( this.argument.start, 'return ' );
		}

		super.transpile( code, transforms );
	}
}
