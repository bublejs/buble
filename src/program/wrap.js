import types from './types/index.js';
import BlockStatement from './BlockStatement.js';
import Node from './Node.js';

export default function wrap ( raw, parent ) {
	if ( Array.isArray( raw ) ) {
		return raw.map( value => wrap( value, parent ) );
	}

	if ( raw && typeof raw === 'object' ) {
		if ( raw.type === 'BlockStatement' ) return new BlockStatement( raw, parent );

		const Constructor = types[ raw.type ] || Node;
		return new Constructor( raw, parent );
	}

	return raw; // scalar value
}
