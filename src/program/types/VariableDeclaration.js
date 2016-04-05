import Node from '../Node.js';

export default class VariableDeclaration extends Node {
	initialise () {
		this.scope = this.findScope( this.kind === 'var' );
		this.declarations.forEach( declarator => declarator.initialise() );
	}

	transpile () {
		if ( this.kind !== 'var' ) {
			this.program.magicString.overwrite( this.start, this.start + this.kind.length, 'var' );
		}

		this.declarations.forEach( declarator => declarator.transpile() );
	}
}
