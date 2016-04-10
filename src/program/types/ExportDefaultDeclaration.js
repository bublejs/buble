import Node from '../Node.js';

export default class ExportDefaultDeclaration extends Node {
	transpile ( code ) {
		super.transpile( code );

		if ( this.declaration.type === 'ClassDeclaration' ) {
			code.insert( this.end, `\n\n${this.getIndentation()}` );
			code.move( this.start, this.declaration.start, this.end );
			code.insert( this.end, `${this.declaration.id.name};` );
		}
	}
}
