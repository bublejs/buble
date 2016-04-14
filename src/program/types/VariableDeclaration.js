import Node from '../Node.js';

export default class VariableDeclaration extends Node {
	initialise () {
		this.scope = this.findScope( this.kind === 'var' );
		this.declarations.forEach( declarator => declarator.initialise() );
	}

	transpile ( code, transforms ) {
		if ( transforms.letConst && this.kind !== 'var' ) {
			code.overwrite( this.start, this.start + this.kind.length, 'var', true );
		}

		this.declarations.forEach( declarator => declarator.transpile( code, transforms ) );
	}
}
