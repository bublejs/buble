import Node from '../Node.js';

export default class UpdateExpression extends Node {
	initialise () {
		if ( this.argument.type === 'Identifier' ) {
			const declaration = this.findScope( false ).findDeclaration( this.argument.name );
			if ( declaration && declaration.kind === 'const' ) {
				// TODO location etc
				throw new Error( `${this.argument.name} is read-only` );
			}
		}

		super.initialise();
	}
}
