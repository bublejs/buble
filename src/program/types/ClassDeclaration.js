import Node from '../Node.js';

export default class ClassDeclaration extends Node {
	initialise () {
		this.findScope( true ).addDeclaration( this.id, 'class' );

		this.constructorIndex = this.body.body.findIndex( node => node.kind === 'constructor' );
		this.constructor = this.body.body[ this.constructorIndex ];

		super.initialise();
	}

	transpile () {
		const magicString = this.program.magicString;

		magicString.overwrite( this.start, this.start + 5, `var ${this.id.name} = function` );

		if ( this.constructor ) {
			magicString.remove( this.constructor.start, this.constructor.value.start );
			magicString.move( this.constructor.value.start, this.constructor.value.end, this.body.start );
			magicString.insert( this.body.start, ';' );

			const nextMethod = this.body.body[ this.constructorIndex + 1 ];
			magicString.remove( this.constructor.end, nextMethod ? nextMethod.start : this.body.end );
		}

		magicString.remove( this.body.start, this.body.body[0].start );

		super.transpile();
	}
}
