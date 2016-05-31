import Node from '../Node.js';

export default class JSXAttribute extends Node {
	transpile ( code, transforms ) {
		if ( this.value ) {
			code.overwrite( this.name.end, this.value.start, ': ' );
		} else {
			// tag without value
			code.overwrite( this.name.start, this.name.end, `${this.name.name}: true`)
		}

		super.transpile( code, transforms );
	}
}
