import Node from '../Node.js';
import reserved from '../../utils/reserved.js';
import CompileError from '../../utils/CompileError.js';

export default class Property extends Node {
	initialise ( transforms ) {
		if ( this.computed ) {
			throw new CompileError( this.key, 'Computed properties are not supported' );
		}

		super.initialise( transforms );
	}

	transpile ( code, transforms ) {
		if ( this.parent.type !== 'ObjectPattern' ) {
			if ( this.shorthand ) {
				code.insert( this.start, `${this.key.name}: ` );
			} else if ( this.method ) {
				code.insert( this.key.end, `: function` );
			}
		}

		if ( transforms.reservedProperties && reserved[ this.key.name ] ) {
			code.insert( this.key.start, `'` );
			code.insert( this.key.end, `'` );
		}

		super.transpile( code, transforms );
	}
}
