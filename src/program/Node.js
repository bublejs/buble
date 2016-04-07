import { walk } from 'estree-walker';
import wrap from './wrap.js';

export default class Node {
	constructor ( raw, parent ) {
		Object.defineProperties( this, {
			parent: { value: parent },
			program: { value: parent.program || parent },
			depth: { value: parent.depth + 1 },
			keys: { value: Object.keys( raw ) }
		});

		this.keys.forEach( key => {
			this[ key ] = wrap( raw[ key ], this );
		});
	}

	findChildren ( selector ) {
		let children = [];
		walk( this, {
			enter ( node ) {
				if ( node.type === selector ) children.push( node );
			}
		});
		return children;
	}

	findLexicalBoundary () {
		return this.parent.findLexicalBoundary();
	}

	findNearest ( selector ) {
		if ( selector.test( this.type ) ) return this;
		return this.parent.findNearest( selector );
	}

	findScope ( functionScope ) {
		return this.parent.findScope( functionScope );
	}

	initialise () {
		//console.log( 'init', this.type )

		this.keys.forEach( key => {
			const value = this[ key ];

			if ( Array.isArray( value ) ) {
				value.forEach( node => node.initialise() );
			} else if ( value && typeof value === 'object' ) {
				value.initialise();
			}
		});
	}

	toString () {
		return this.program.magicString.slice( this.start, this.end );
	}

	transpile () {
		//console.log( 'transpile', this.type )

		this.keys.forEach( key => {
			const value = this[ key ];

			if ( Array.isArray( value ) ) {
				value.forEach( node => node.transpile() );
			} else if ( value && typeof value === 'object' ) {
				value.transpile();
			}
		});
	}
}
