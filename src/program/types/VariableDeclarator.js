import Node from '../Node.js';
import unsupported from '../../utils/unsupported.js';

export default class VariableDeclarator extends Node {
	initialise () {
		this.isObjectPattern = this.id.type === 'ObjectPattern';

		// disallow compound destructuring, for now at least
		if ( /Pattern/.test( this.id.type ) ) {
			this.id[ this.isObjectPattern ? 'properties' : 'elements' ].forEach( node => {
				if ( /Pattern/.test( this.isObjectPattern ? node.value.type : node.type ) ) {
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
				this.insertAtStart( `${name} = ` );
				this.init.moveTo( this.start );
				this.insertAtStart( `, ` );
			} else {
				this.init.remove();
			}

			const props = this.isObjectPattern ? this.id.properties : this.id.elements;

			code.remove( this.start, props[0].start );

			props.forEach( this.isObjectPattern ?
				property => {
					property.replaceWith( `${property.value.name} = ${name}.${property.key.name}` );
				} :
				( property, i ) => {
					property.replaceWith( `${property.name} = ${name}[${i}]` );
				});

			code.remove( props[ props.length - 1 ].end, this.init.start );
		}

		super.transpile( code );
	}
}
