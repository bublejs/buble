import Node from '../Node.js';

export default class ExportDefaultDeclaration extends Node {
	transpile () {
		super.transpile();

		if ( this.declaration.type === 'ClassDeclaration' ) {
			this.insertAtEnd( `\n\n${this.getIndentation()}` );
			this.program.magicString.move( this.start, this.declaration.start, this.end );
			this.insertAtEnd( `${this.declaration.id.name};` );
		}
	}
}
