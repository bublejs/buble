import Node from '../Node.js';

export default class FunctionExpression extends Node {
	initialise () {
		this.body.createScope();

		if ( this.id ) {
			// function expression IDs belong to the child scope...
			this.body.scope.addDeclaration( this.id, 'function' );
		}

		super.initialise();
	}
}
