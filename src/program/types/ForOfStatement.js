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

		if ( this.body.synthetic ) {
			code.insert( this.body.body[0].start, `{\n${i1}` );
			code.insert( this.body.body[0].end, `\n${i0}}` );
		}

		// this is rather finicky, owing to magic-string's quirks
		const bodyStart = this.body.body[0].start;
		let startIndex = this.left.start;
		while ( code.original[ startIndex - 1 ] !== '(' ) startIndex -= 1;

		code.remove( this.left.end, this.right.start );
		code.remove( startIndex, this.left.start );
		code.remove( this.start + 3, startIndex );

		code.insert( startIndex, ` ( var ${key} = 0, ${list} = ` );

		code.move( this.left.start, this.left.end, bodyStart );
		code.move( this.right.start, this.right.end, startIndex );
		code.insert( startIndex, `; ${key} < ${list}.length; ${key} += 1` );
		code.insert( bodyStart, ` = ${list}[${key}];\n\n${i1}` );

		super.transpile( code, transforms );
	}
}
