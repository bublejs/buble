import Node from '../Node.js';
import reserved from '../../utils/reserved.js';

export default class SpreadProperty extends Node {
	transpile ( code, transforms ) {
		code.overwrite( this.start, this.end, this.argument.name );

		super.transpile( code, transforms );
	}
}
