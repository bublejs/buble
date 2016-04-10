import Node from '../Node.js';
import unsupported from '../../utils/unsupported.js';

export default class Property extends Node {
	initialise () {
		if ( this.computed ) {
			unsupported( this, 'Computed properties are not supported' );
		}

		super.initialise();
	}

	transpile ( code ) {
		if ( this.parent.type !== 'ObjectPattern' ) {
			if ( this.shorthand ) {
				code.insert( this.start, `${this.key.name}: ` );
			} else if ( this.method ) {
				code.insert( this.key.end, `: function` );
			}
		}

		super.transpile( code );
	}
}
