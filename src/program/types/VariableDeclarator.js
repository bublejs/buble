import Node from '../Node.js';
import unsupported from '../../utils/unsupported.js';

export default class VariableDeclarator extends Node {
	initialise () {
		this.isObjectPattern = this.id.type === 'ObjectPattern';

		// disallow compound destructuring, for now at least
		if ( /Pattern/.test( this.id.type ) ) {
			this.id[ this.isObjectPattern ? 'properties' : 'elements' ].forEach( node => {
				if ( node && /Pattern/.test( this.isObjectPattern ? node.value.type : node.type ) ) {
					unsupported( this, 'Compound destructuring is not supported' );
				}
			});
		}

		this.parent.scope.addDeclaration( this.id, this.parent.kind );
		super.initialise();
	}

	transpile ( code ) {
		if ( this.id.type !== 'Identifier' ) {
			const simple = this.init.type === 'Identifier';
			const name = simple ? this.init.name : this.findScope( true ).createIdentifier( 'ref' );

			if ( !simple ) {
				code.insert( this.start, `${name} = ` );
				code.move( this.init.start, this.init.end, this.start );
				code.insert( this.start, `, ` );
			} else {
				code.remove( this.init.start, this.init.end );
			}

			const props = this.isObjectPattern ? this.id.properties : this.id.elements;

			code.remove( this.start, props[0].start );

			let lastIndex = this.start;
			let first = true;

			props.forEach( ( property, i ) => {
				if ( property ) {
					const lhs = this.isObjectPattern ? property.value.name : property.name;
					const rhs = this.isObjectPattern ? `${name}.${property.key.name}` : `${name}[${i}]`;

					code.overwrite( lastIndex, property.end, `${first ? '' : ', '}${lhs} = ${rhs}` );
					lastIndex = property.end;
					first = false;
				}
			});

			code.remove( lastIndex, this.init.start );
		}

		super.transpile( code );
	}
}
