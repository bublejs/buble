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

	findChildren ( type ) {
		let children = [];
		walk( this, {
			enter ( node ) {
				if ( node.type === type ) children.push( node );
			}
		});
		return children;
	}

	findLexicalBoundary () {
		return this.parent.findLexicalBoundary();
	}

	findNearest ( type ) {
		if ( this.type === type ) return this;
		return this.parent.findNearest( type );
	}

	findScope ( functionScope ) {
		return this.parent.findScope( functionScope );
	}

	getIndentation () {
		const lastLine = /\n(.+)$/.exec( this.program.magicString.original.slice( 0, this.start ) );
		return lastLine ? /^[ \t]*/.exec( lastLine[1] )[0] : '';
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
