import Node from '../Node.js';

export default class VariableDeclaration extends Node {
	initialise () {
		this.scope = this.findScope( this.kind === 'var' );
		this.declarations.forEach( declarator => declarator.initialise() );
	}

	transpile ( code ) {
		if ( this.kind !== 'var' ) {
			code.overwrite( this.start, this.start + this.kind.length, 'var' );
		}

		this.declarations.forEach( declarator => declarator.transpile( code ) );
	}
}
