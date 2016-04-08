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
				magicString.insert( this.body.start, `() {\n${indentation + indentStr + indentStr}${superName}.apply(this, arguments);\n${indentation + indentStr}}` );
			}

			magicString.insert( this.body.start, `\n\n${indentation + indentStr}${name}.prototype = Object.create( ${superName} && ${superName}.prototype );\n${indentation + indentStr}${name}.prototype.constructor = ${name};` );
			if ( !this.constructor ) magicString.insert( this.body.start, `\n\n${indentation + indentStr}` );
		} else {
			deindent( this.body, magicString );

			magicString.overwrite( this.start, this.start + 5, `var ${name} = function` );

			if ( this.constructor ) {
				magicString.remove( this.constructor.start, this.constructor.value.start );
				magicString.move( this.constructor.value.start, this.constructor.value.end, this.body.start );
				magicString.insert( this.body.start, ';' );
			} else {
				magicString.insert( this.body.start, this.body.body.length ? `() {};\n\n${indentation}` : `() {};` );
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

			magicString.insert( method.start, `${lhs} = function ` );
			magicString.insert( method.end, ';' );
		});

		magicString.remove( lastIndex, this.end );

		if ( this.superClass ) {
			magicString.insert( this.end, `\n\n${indentation + indentStr}return ${name};\n${indentation}}(${superName}));` );
		}

		super.transpile();
	}
}
