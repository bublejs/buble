import Node from '../Node.js';

export default class ArrowFunctionExpression extends Node {
	initialise () {
		super.initialise();
	}

	transpile () {
		if ( this.params.length === 0 ) {
			this.program.magicString.overwrite( this.start, this.body.start, 'function () ' );
		} else {
			this.program.magicString.overwrite( this.start, this.params[0].start, 'function ( ' );
			this.program.magicString.overwrite( this.params[ this.params.length - 1 ].end, this.body.start, ' ) ' );
		}

		if ( this.body.type !== 'BlockStatement' ) {
			this.program.magicString.insert( this.body.start, '{ return ' );
			this.program.magicString.insert( this.body.end, '; }' );
		}

		super.transpile();
	}
}
