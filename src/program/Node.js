import wrap from './wrap.js';

const statementsWithBlocks = {
	IfStatement: 'consequent',
	ForStatement: 'body',
	ForInStatement: 'body',
	ForOfStatement: 'body',
	WhileStatement: 'body',
	DoWhileStatement: 'body',
	ArrowFunctionExpression: 'body'
};

export default class Node {
	constructor ( raw, parent ) {
		Object.defineProperties( this, {
			parent: { value: parent },
			program: { value: parent.program || parent },
			depth: { value: parent.depth + 1 },
			keys: { value: Object.keys( raw ) },
			indentation: { value: undefined, writable: true }
		});

		// special case – body-less if/for/while statements. TODO others?
		const type = statementsWithBlocks[ raw.type ];
		if ( type && raw[ type ].type !== 'BlockStatement' ) {
			const nonBlock = raw[ type ];

			// create a synthetic block statement, otherwise all hell
			// breaks loose when it comes to block scoping
			raw[ type ] = {
				start: nonBlock.start,
				end: nonBlock.end,
				type: 'BlockStatement',
				body: [ nonBlock ],
				synthetic: true
			};
		}

		for ( const key of this.keys ) {
			this[ key ] = wrap( raw[ key ], this );
		}

		this.program.magicString.addSourcemapLocation( this.start );
		this.program.magicString.addSourcemapLocation( this.end );
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
