import Node from '../Node.js';

export default class VariableDeclarator extends Node {
	initialise () {
		this.id.initialise();
		if ( this.init ) this.init.initialise();
	}

	transpile () {
		this.id.transpile();
		if ( this.init ) this.init.transpile();
	}
}
