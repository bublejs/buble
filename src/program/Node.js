import wrap from './wrap.js';
import keys from './keys.js';

export default class Node {
	constructor ( raw, parent ) {
		Object.defineProperties( raw, {
			parent: { value: parent },
			program: { value: parent.program || parent },
			depth: { value: parent.depth + 1 },
			keys: { value: keys[ raw.type ] },
			indentation: { value: undefined, writable: true }
		});

		for ( const key of keys[ raw.type ] ) {
			wrap( raw[ key ], raw );
		}

		raw.program.magicString.addSourcemapLocation( raw.start );
		raw.program.magicString.addSourcemapLocation( raw.end );
	}

	ancestor ( level ) {
		let node = this;
		while ( level-- ) {
			node = node.parent;
			if ( !node ) return null;
		}

		return node;
	}

	contains ( node ) {
		while ( node ) {
			if ( node === this ) return true;
			node = node.parent;
		}

		return false;
	}

	findLexicalBoundary () {
		return this.parent.findLexicalBoundary();
	}

	findNearest ( type ) {
		if ( typeof type === 'string' ) type = new RegExp( `^${type}$` );
		if ( type.test( this.type ) ) return this;
		return this.parent.findNearest( type );
	}

	findScope ( functionScope ) {
		return this.parent.findScope( functionScope );
	}

	getIndentation () {
		if ( this.indentation === undefined ) {
			const source = this.program.magicString.original;
			let c = this.start;
			while ( c && source[c] !== '\n' ) c -= 1;

			this.indentation = '';

			while ( true ) {
				c += 1;
				const char = source[c];

				if ( char !== ' ' && char !== '\t' ) break;

				this.indentation += char;
			}
		}

		return this.indentation;
	}

	initialise ( transforms ) {
		for ( var key of this.keys ) {
			const value = this[ key ];

			if ( Array.isArray( value ) ) {
				value.forEach( node => node && node.initialise( transforms ) );
			} else if ( value && typeof value === 'object' ) {
				value.initialise( transforms );
			}
		}
	}

	toString () {
		return this.program.magicString.slice( this.start, this.end );
	}

	transpile ( code, transforms ) {
		for ( const key of this.keys ) {
			const value = this[ key ];

			if ( Array.isArray( value ) ) {
				value.forEach( node => node && node.transpile( code, transforms ) );
			} else if ( value && typeof value === 'object' ) {
				value.transpile( code, transforms );
			}
		}
	}
}
