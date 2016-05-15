import types from './types/index.js';
import BlockStatement from './BlockStatement.js';
import Node from './Node.js';
import keys from './keys.js';

const statementsWithBlocks = {
	IfStatement: 'consequent',
	ForStatement: 'body',
	ForInStatement: 'body',
	ForOfStatement: 'body',
	WhileStatement: 'body',
	DoWhileStatement: 'body',
	ArrowFunctionExpression: 'body'
};

export default function wrap ( raw, parent ) {
	if ( Array.isArray( raw ) ) {
		raw.forEach( raw => wrap( raw, parent ) );
		return;
	}

	if ( raw && typeof raw === 'object' ) {
		// with e.g. shorthand properties, key and value are
		// the same node. We don't want to wrap an object twice
		if ( raw && raw.__wrapped ) return;
		raw.__wrapped = true;

		if ( !keys[ raw.type ] ) {
			keys[ raw.type ] = Object.keys( raw ).filter( key => typeof raw[ key ] === 'object' );
		}

		// special case – body-less if/for/while statements. TODO others?
		const bodyType = statementsWithBlocks[ raw.type ];
		if ( bodyType && raw[ bodyType ].type !== 'BlockStatement' ) {
			const expression = raw[ bodyType ];

			// create a synthetic block statement, otherwise all hell
			// breaks loose when it comes to block scoping
			raw[ bodyType ] = {
				start: expression.start,
				end: expression.end,
				type: 'BlockStatement',
				body: [ expression ],
				synthetic: true
			};
		}

		if ( raw.type === 'BlockStatement' ) {
			Node( raw, parent );
			raw.__proto__ = BlockStatement.prototype;
		} else {
			const Constructor = types[ raw.type ] || Node;
			Node( raw, parent );
			raw.__proto__ = Constructor.prototype;
		}
	}

	return raw; // scalar value
}
