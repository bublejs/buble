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
			const simple = this.init.type === 'Identifier' && !this.init.rewritten;
			const props = this.isObjectPattern ? this.id.properties : this.id.elements;
			const i0 = this.getIndentation();

			const name = simple ? this.init.name : this.findScope( true ).createIdentifier( 'ref' );

			let c = this.start;
			let first = simple;

			if ( simple ) {
				code.remove( this.id.end, this.end );
			} else {
				code.insertRight( this.id.end, `${name}` );
				code.move( this.id.end, this.end, c );
			}

			props.forEach( ( property, i ) => {
				if ( property ) {
					const id = this.isObjectPattern ? property.value : property;
					const rhs = this.isObjectPattern ? `${name}.${property.key.name}` : `${name}[${i}]`;

					let start = first ? '' : 'var ';
					if ( !first ) start = `;\n${i0}${start}`;

					code.insertRight( id.start, start );
					code.move( id.start, id.end, this.start );
					code.insertLeft( id.end, ` = ${rhs}` );

					code.remove( c, id.start );
					c = property.end;

					first = false;
				}
			});

			code.remove( c, this.id.end );
		}

		super.transpile( code, transforms );
	}
}
