import { walk } from 'estree-walker';
import wrap from './wrap.js';

const statementsWithBlocks = {
	IfStatement: 'consequent',
	ForStatement: 'body',
	WhileStatement: 'body',
	ArrowFunctionExpression: 'body'
};

export default class Node {
	constructor ( raw, parent ) {
		Object.defineProperties( this, {
			parent: { value: parent },
			program: { value: parent.program || parent },
			depth: { value: parent.depth + 1 },
			keys: { value: Object.keys( raw ) }
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

		this.keys.forEach( key => {
			this[ key ] = wrap( raw[ key ], this );
		});

		this.program.magicString.addSourcemapLocation( this.start );
		this.program.magicString.addSourcemapLocation( this.end );
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
		const lastLine = /\n(.+)$/.exec( this.program.magicString.original.slice( 0, this.start ) );
		return lastLine ? /^[ \t]*/.exec( lastLine[1] )[0] : '';
	}

	initialise () {
		this.keys.forEach( key => {
			const value = this[ key ];

			if ( Array.isArray( value ) ) {
				value.forEach( node => node && node.initialise() );
			} else if ( value && typeof value === 'object' ) {
				value.initialise();
			}
		});
	}

	toString () {
		return this.program.magicString.slice( this.start, this.end );
	}

	transpile ( code ) {
		this.keys.forEach( key => {
			const value = this[ key ];

			if ( Array.isArray( value ) ) {
				value.forEach( node => node && node.transpile( code ) );
			} else if ( value && typeof value === 'object' ) {
				value.transpile( code );
			}
		});
	}
}
