import Node from '../Node.js';

export default class JSXAttribute extends Node {
	transpile ( code, transforms ) {
		code.overwrite( this.name.end, this.value.start, ': ' );

		super.transpile( code, transforms );
	}
}
