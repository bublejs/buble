import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class Literal extends Node {
	initialise ( transforms ) {
		if ( transforms.numericLiteral ) {
			const leading = this.raw.slice( 0, 2 );
			if ( leading === '0b' || leading === '0o' ) {
				this.mark();
			}
		}

		if ( this.regex ) {
			if ( transforms.unicodeRegExp && /u/.test( this.regex.flags ) ) throw new CompileError( this, 'Regular expression unicode flag is not supported' );
			if ( transforms.stickyRegExp && /y/.test( this.regex.flags ) ) throw new CompileError( this, 'Regular expression sticky flag is not supported' );
		}
	}

	transpile ( code, transforms ) {
		code.overwrite( this.start, this.end, String( this.value ), true );
	}
}
