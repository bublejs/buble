import Node from '../Node.js';
import deindent from '../../utils/deindent.js';

export default class ClassDeclaration extends Node {
	initialise ( transforms ) {
		this.name = this.id.name;
		this.findScope( true ).addDeclaration( this.id, 'class' );

		super.initialise( transforms );
	}

	transpile ( code, transforms ) {
		if ( transforms.classes ) {
			const superName = this.superClass && ( this.superClass.name || 'superclass' );

			const indentation = this.getIndentation();
			const indentStr = code.getIndentString();

			code.overwrite( this.start, this.id.start, 'var ' );

			if ( this.superClass ) {
				code.overwrite( this.id.end, this.superClass.start, ' = ' );
				code.overwrite( this.superClass.end, this.body.start, `(function (${superName}) {\n${indentation}${indentStr}` );
			} else {
				code.overwrite( this.id.end, this.body.start, ' = ' );
			}

			this.body.transpile( code, transforms, !!this.superClass, superName );

			if ( this.superClass ) {
				code.insert( this.end, `\n\n${indentation}${indentStr}return ${this.name};\n${indentation}}(` );
				code.move( this.superClass.start, this.superClass.end, this.end );
				code.insert( this.end, '));' );
			}

			if ( !this.superClass ) deindent( this.body, code );
		}

		else {
			this.body.transpile( code, transforms, false, null );
		}
	}
}
