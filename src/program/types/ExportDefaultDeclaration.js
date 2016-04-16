import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class ExportDefaultDeclaration extends Node {
	initialise ( transforms ) {
		if ( transforms.moduleExport ) throw new CompileError( this, 'export is not supported' );
		super.initialise( transforms );
	}

	transpile ( code, transforms ) {
		super.transpile( code, transforms );

		if ( this.declaration.type === 'ClassDeclaration' ) {
			code.insert( this.end, `\n\n${this.getIndentation()}` );
			code.move( this.start, this.declaration.start, this.end );
			code.insert( this.end, `${this.declaration.id.name};` );
		}
	}
}
