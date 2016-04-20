import LoopStatement from './shared/LoopStatement.js';
import CompileError from '../../utils/CompileError.js';

export default class ForOfStatement extends LoopStatement {
	initialise ( transforms ) {
		if ( transforms.forOf && !transforms.dangerousForOf ) throw new CompileError( this, 'for...of statements are not supported' );
		super.initialise( transforms );
	}

	transpile ( code, transforms ) {
		if ( !transforms.dangerousForOf ) {
			super.transpile( code, transforms );
			return;
		}

		const scope = this.findScope( true );
		const i0 = this.getIndentation();
		const i1 = i0 + code.getIndentString();

		const key = scope.createIdentifier( 'i' );
		const list = scope.createIdentifier( 'list' );

		code.overwrite( this.start + 3, this.left.start, ` ( var ${key} = 0, ${list} = ` );
		code.move( this.right.start, this.right.end, this.left.start );
		code.insert( this.left.start, `; ${key} < ${list}.length; ${key} += 1 ) {\n${i1}` );
		code.insert( this.left.end, ` = ${list}[${key}];\n\n${i1}` );
		code.remove( this.left.end, this.right.start );
		code.remove( this.right.end, this.body.body[0].start );

		super.transpile( code, transforms );
	}
}
