import Node from '../Node.js';

export default class VariableDeclaration extends Node {
	initialise () {
		this.declarations.forEach( declarator => declarator.initialise() );
	}

	transpile () {
		this.declarations.forEach( declarator => declarator.transpile() );
	}
}
