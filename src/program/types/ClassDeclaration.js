import Node from '../Node.js';
import deindent from '../../utils/deindent.js';

export default class ClassDeclaration extends Node {
	initialise () {
		this.name = this.id.name;
		this.findScope( true ).addDeclaration( this.id, 'class' );

		super.initialise();
	}

	transpile () {
		const magicString = this.program.magicString;
		const superName = this.superClass && this.superClass.name;

		const indentation = this.getIndentation();
		const indentStr = magicString.getIndentString();

		const intro = this.superClass ?
			`var ${this.name} = (function (${superName}) {\n${indentation}${indentStr}` :
			`var ${this.name} = `;

		const outro = this.superClass ?
			`\n\n${indentation}${indentStr}return ${this.name};\n${indentation}}(${superName}));` :
			``;

		magicString.remove( this.start, this.body.start );
		this.insertAtStart( intro );
		this.insertAtEnd( outro );

		if ( !this.superClass ) deindent( this.body, magicString );

		this.body.transpile( !!this.superClass );
	}
}
