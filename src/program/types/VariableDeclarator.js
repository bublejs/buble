import Node from '../Node.js';
import unsupported from '../../utils/unsupported.js';

export default class VariableDeclarator extends Node {
	initialise () {
		// disallow compound destructuring, for now at least
		if ( /Pattern/.test( this.id.type ) ) {
			this.id[ this.id.type === 'ObjectPattern' ? 'properties' : 'elements' ].forEach( property => {
				if ( /Pattern/.test( property.value.type ) ) {
					unsupported( this, 'Compound destructuring is not supported' );
				}
			});
		}

		this.parent.scope.addDeclaration( this.id, this.parent.kind );
		super.initialise();
	}

	transpile () {


		if ( this.id.type !== 'Identifier' ) {
			const simple = this.init.type === 'Identifier';
			const name = simple ? this.init.name : this.findScope( true ).createIdentifier( 'ref' );

			if ( !simple ) {
				this.program.magicString.insert( this.start, `${name} = ` );
				this.program.magicString.move( this.init.start, this.init.end, this.start );
				this.program.magicString.insert( this.start, `, ` );
			} else {
				this.program.magicString.remove( this.init.start, this.init.end );
			}

			if ( this.id.type === 'ObjectPattern' ) {
				const props = this.id.properties;

				this.program.magicString.remove( this.start, props[0].start );

				props.forEach( property => {
					this.program.magicString.overwrite( property.start, property.end, `${property.value.name} = ${name}.${property.key.name}` );
				});

				this.program.magicString.remove( props[ props.length - 1 ].end, this.init.start );
			} else if ( this.id.type === 'ArrayPattern' ) {

			}

			else {
				throw new Error( 'Well, this is unexpected.' );
			}
		}

		super.transpile();
	}
}
