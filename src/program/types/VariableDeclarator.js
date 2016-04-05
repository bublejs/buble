import Node from '../Node.js';

export default class VariableDeclarator extends Node {
	initialise () {
		this.parent.scope.addDeclaration( this.id, this.parent.kind );
		super.initialise();
	}
}
