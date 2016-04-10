import Node from '../Node.js';

export default class Literal extends Node {
	transpile ( code ) {
		const leading = this.raw.slice( 0, 2 );
		if ( leading === '0b' || leading === '0o' ) {
			code.overwrite( this.start, this.end, String( this.value ), true );
		}
	}
}
