import Node from '../Node.js';

export default class ExportDefaultDeclaration extends Node {
	transpile ( code ) {
		super.transpile( code );

		if ( this.declaration.type === 'ClassDeclaration' ) {
			this.insertAtEnd( `\n\n${this.getIndentation()}` );
			code.move( this.start, this.declaration.start, this.end );
			this.insertAtEnd( `${this.declaration.id.name};` );
		}
	}
}
