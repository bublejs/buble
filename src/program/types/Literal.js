import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class Literal extends Node {
	transpile ( code ) {
		const leading = this.raw.slice( 0, 2 );
		if ( leading === '0b' || leading === '0o' ) {
			code.overwrite( this.start, this.end, String( this.value ), true );
		}

		if ( this.regex ) {
			if ( /u/.test( this.regex.flags ) ) throw new CompileError( this, 'Regular expression unicode flag is not supported' );
			if ( /y/.test( this.regex.flags ) ) throw new CompileError( this, 'Regular expression sticky flag is not supported' );
		}
	}
}
