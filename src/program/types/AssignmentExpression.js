import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class AssignmentExpression extends Node {
	initialise () {
		if ( this.left.type === 'Identifier' ) {
			const declaration = this.findScope( false ).findDeclaration( this.left.name );
			if ( declaration && declaration.kind === 'const' ) {
				throw new CompileError( this.left, `${this.left.name} is read-only` );
			}
		}

		if ( this.left.type === 'ArrayPattern' ) {
			throw new CompileError( this.left, 'Assigning to an array pattern is not currently supported' );
		}

		super.initialise();
	}
}
