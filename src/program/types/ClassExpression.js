import Node from '../Node.js';

export default class ClassExpression extends Node {
	initialise () {
		this.name = this.id ? this.id.name :
		            this.parent.type === 'VariableDeclarator' ? this.parent.id.name :
		            this.parent.type === 'AssignmentExpression' ? this.parent.left.name :
		            this.findScope( true ).createIdentifier( 'anonymous' );
	}

	transpile ( code ) {
		const superName = this.superClass && this.superClass.name;

		const indentation = this.getIndentation();
		const indentStr = code.getIndentString();

		code.overwrite( this.start, this.body.start, `(function (${superName || ''}) {\n${indentation}${indentStr}` );

		this.body.transpile( code, true );

		this.insertAtEnd( `\n\n${indentation}${indentStr}return ${this.name};\n${indentation}}(${superName || ''}))` );
	}
}
