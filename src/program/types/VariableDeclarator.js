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

	transpile ( code, transforms ) {
		if ( transforms.destructuring && this.id.type !== 'Identifier' ) {
			const simple = this.init.type === 'Identifier';
			const name = simple ? this.init.name : this.findScope( true ).createIdentifier( 'ref' );

			const props = this.isObjectPattern ? this.id.properties : this.id.elements;

			props.forEach( ( property, i ) => {
				if ( property ) {
					const id = this.isObjectPattern ? property.value : property;
					const rhs = this.isObjectPattern ? `${name}.${property.key.name}` : `${name}[${i}]`;

					if (!simple || i !== 0) {
						code.insert( this.end, `, ` );
					}

					code.move( id.start, id.end, this.end );
					code.insert( this.end, ` = ${rhs}` );
				}
			});

			if ( !simple ) {
				code.overwrite( this.id.start, this.id.end, name );
			} else {
				code.remove( this.start, this.end );
			}
		}

		super.transpile( code, transforms );
	}
}
