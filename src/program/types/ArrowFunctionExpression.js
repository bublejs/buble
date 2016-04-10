import Node from '../Node.js';

export default class ArrowFunctionExpression extends Node {
	initialise () {
		this.body.createScope();
		super.initialise();
	}

	transpile ( code ) {
		if ( this.params.length === 0 ) {
			code.overwrite( this.start, this.body.start, 'function () ' );
		} else {
			code.overwrite( this.start, this.params[0].start, 'function ( ' );
			code.overwrite( this.params[ this.params.length - 1 ].end, this.body.start, ' ) ' );
		}

		if ( this.body.synthetic ) {
			code.insert( this.body.start, '{ return ' );
			code.insert( this.body.end, '; }' );
		}

		super.transpile( code );
	}
}
