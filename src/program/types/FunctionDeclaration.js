import Node from '../Node.js';

export default class FunctionDeclaration extends Node {
	initialise () {
		this.body.createScope();

		this.findScope( true ).addDeclaration( this.id, 'function' );
		super.initialise();
	}
}
