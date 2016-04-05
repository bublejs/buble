import Node from '../Node.js';

export default class AssignmentExpression extends Node {
	initialise () {
		if ( this.left.type === 'Identifier' ) {
			const declaration = this.findScope( false ).findDeclaration( this.left.name );
			if ( declaration.kind === 'const' ) {
				// TODO location etc
				throw new Error( `${this.left.name} is read-only` );
			}
		}

		super.initialise();
	}
}
