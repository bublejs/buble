import Node from '../Node.js';

export default class ClassExpression extends Node {
	initialise () {
		this.name = this.id ? this.id.name :
		            this.parent.type === 'VariableDeclarator' ? this.parent.id.name :
		            this.parent.type === 'AssignmentExpression' ? this.parent.left.name :
		            this.findScope( true ).createIdentifier( 'anonymous' );
	}

	transpile () {
		const magicString = this.program.magicString;
		const superName = this.superClass && this.superClass.name;

		const indentation = this.getIndentation();
		const indentStr = magicString.getIndentString();

		magicString.overwrite( this.start, this.body.start, `(function (${superName || ''}) {\n${indentation}${indentStr}` );

		this.body.transpile( true );

		this.insertAtEnd( `\n\n${indentation}${indentStr}return ${this.name};\n${indentation}}(${superName || ''}))` );
	}
}
