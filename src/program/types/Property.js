import Node from '../Node.js';
import unsupported from '../../utils/unsupported.js';

export default class Property extends Node {
	initialise () {
		if ( this.computed ) {
			unsupported( this, 'Computed properties' );
		}
	}

	transpile () {
		if ( this.shorthand ) {
			this.program.magicString.insert( this.start, `${this.key.name}: ` );
		} else if ( this.method ) {
			this.program.magicString.insert( this.key.end, `: function` );
		}

		super.transpile();
	}
}
