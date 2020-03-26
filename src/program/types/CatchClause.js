import Node from '../Node.js';
import Scope from '../Scope.js';

export default class CatchClause extends Node {
	initialise(transforms) {
		this.createdDeclarations = [];
		this.scope = new Scope({
			block: true,
			parent: this.parent.findScope(false),
			declare: id => this.createdDeclarations.push(id)
		});

		this.scope.addDeclaration(this.param, 'catch');

		super.initialise(transforms);
		this.scope.consolidate();
	}

	findScope(functionScope) {
		return functionScope
			? this.parent.findScope(functionScope)
			: this.scope;
	}
}

