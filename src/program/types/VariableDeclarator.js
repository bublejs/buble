import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class VariableDeclarator extends Node {
	initialise ( transforms ) {
		this.isObjectPattern = this.id.type === 'ObjectPattern';

		// disallow compound destructuring, for now at least
		if ( /Pattern/.test( this.id.type ) ) {
			this.id[ this.isObjectPattern ? 'properties' : 'elements' ].forEach( node => {
				if ( node && /Pattern/.test( this.isObjectPattern ? node.value.type : node.type ) ) {
					throw new CompileError( node.value, 'Compound destructuring is not supported' );
				}
			});
		}

		let kind = this.parent.kind;
		if ( kind === 'let' && this.parent.parent.type === 'ForStatement' ) {
			kind = 'for.let'; // special case...
		}

		this.parent.scope.addDeclaration( this.id, kind );
		super.initialise( transforms );
	}
}
