import Node from '../Node.js';
import deindent from '../../utils/deindent.js';

export default class ClassDeclaration extends Node {
	initialise () {
		this.findScope( true ).addDeclaration( this.id, 'class' );

		this.constructorIndex = this.body.body.findIndex( node => node.kind === 'constructor' );
		this.constructor = this.body.body[ this.constructorIndex ];

		super.initialise();
	}

	transpile () {
		const magicString = this.program.magicString;

		const indentation = this.getIndentation();
		const indentStr = magicString.getIndentString();

		const name = this.id.name;
		const superName = this.superClass && this.superClass.name;

		if ( this.superClass ) {
			magicString.overwrite( this.start, this.start + 5, `var ${name} = (function (${superName}) {\n${indentation + indentStr}function` );
			magicString.remove( this.id.end, this.superClass.end );

			if ( this.constructor ) {
				magicString.remove( this.constructor.start, this.constructor.value.start );
				magicString.move( this.constructor.value.start, this.constructor.value.end, this.body.start );
			} else {
				this.body.insertAtStart( `() {\n${indentation + indentStr + indentStr}${superName}.apply(this, arguments);\n${indentation + indentStr}}` );
			}

			this.body.insertAtStart( `\n\n${indentation + indentStr}${name}.prototype = Object.create( ${superName} && ${superName}.prototype );\n${indentation + indentStr}${name}.prototype.constructor = ${name};` );
			if ( !this.constructor ) this.body.insertAtStart( `\n\n${indentation + indentStr}` );
		} else {
			deindent( this.body, magicString );

			magicString.overwrite( this.start, this.start + 5, `var ${name} = function` );

			if ( this.constructor ) {
				magicString.remove( this.constructor.start, this.constructor.value.start );
				this.constructor.value.moveTo( this.body.start );
				this.body.insertAtStart( ';' );
			} else {
				this.body.insertAtStart( this.body.body.length ? `() {};\n\n${indentation}` : `() {};` );
			}
		}

		let lastIndex = this.body.start;

		if ( this.body.body.length ) magicString.remove( this.body.start, this.body.body[0].start );

		this.body.body.forEach( method => {
			lastIndex = method.end;

			if ( method.kind === 'constructor' ) return;

			if ( method.static ) magicString.remove( method.start, method.start + 7 );

			const lhs = method.static ?
				`${name}.${method.key.name}` :
				`${name}.prototype.${method.key.name}`;

			method.insertAtStart( `${lhs} = function ` );
			method.insertAtEnd( ';' );

			// prevent function name shadowing an existing declaration
			const scope = this.findScope( false );
			if ( scope.contains( method.key.name ) ) {
				method.key.replaceWith( scope.createIdentifier( method.key.name ), true );
			}
		});

		magicString.remove( lastIndex, this.end );

		if ( this.superClass ) {
			this.insertAtEnd( `\n\n${indentation + indentStr}return ${name};\n${indentation}}(${superName}));` );
		}

		super.transpile();
	}
}
