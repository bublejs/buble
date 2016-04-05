import Node from '../Node.js';
import unsupported from '../../utils/unsupported.js';

export default class Property extends Node {
	initialise () {
		if ( this.computed ) {
			unsupported( this, 'Computed properties are not supported' );
		}
	}

	transpile () {
		if ( this.parent.type !== 'ObjectPattern' ) {
			if ( this.shorthand ) {
				this.program.magicString.insert( this.start, `${this.key.name}: ` );
			} else if ( this.method ) {
				this.program.magicString.insert( this.key.end, `: function` );
			}
		}

		super.transpile();
	}
}
