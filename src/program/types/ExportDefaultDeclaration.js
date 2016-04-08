import Node from '../Node.js';

export default class ExportDefaultDeclaration extends Node {
	transpile () {
		super.transpile();

		if ( this.declaration.type === 'ClassDeclaration' ) {
			this.program.magicString.insert( this.end, `\n\n${this.getIndentation()}` );
			this.program.magicString.move( this.start, this.declaration.start, this.end );
			this.program.magicString.insert( this.end, `${this.declaration.id.name};` );
		}
	}
}
