import Node from '../Node.js';

export default class JSXSpreadAttribute extends Node {
	transpile ( code, transforms ) {
    code.overwrite( this.start, this.end, this.argument.name );

		super.transpile( code, transforms );
	}
}
