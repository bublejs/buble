function isArguments ( node ) {
	return node.type === 'Identifier' && node.name === 'arguments';
}

export default function spread ( code, elements, start, end ) {
	let i = elements.length;
	let firstSpreadIndex = -1;

	while ( i-- ) {
		const element = elements[i];
		if ( element.type === 'SpreadElement' ) {
			if ( isArguments( element.argument ) ) {
				code.insertRight( element.argument.start, 'Array.apply(null, ' );

				// special case – if this is [ ...arguments ], skip the closing
				// paren, because we're not opening a new one with .concat
				if ( i === 0 && elements.length === 1 ) {
					code.remove( start, element.start );
				} else {
					code.insertLeft( element.argument.end, ')' );
				}
			}

			firstSpreadIndex = i;
		}
	}

	if ( ~firstSpreadIndex ) {
		let element = elements[ firstSpreadIndex ];
		const previousElement = elements[ firstSpreadIndex - 1 ];

		if ( !previousElement ) {
			if ( elements.length === 1 ) {
				if ( !isArguments( element.argument ) ) {
					code.overwrite( start, element.start, '[].concat(' );
				}
			} else {
				code.remove( start, element.start );
				code.overwrite( element.end, elements[1].start, '.concat(' );
			}
		}

		else {
			code.overwrite( previousElement.end, element.start, '].concat(' );
		}

		for ( i = firstSpreadIndex; i < elements.length; i += 1 ) {
			element = elements[i];

			if ( element ) {
				if ( element.type === 'SpreadElement' ) {
					code.remove( element.start, element.argument.start );
				} else {
					code.insertRight( element.start, '[' );
					code.insertLeft( element.end, ']' );
				}
			}
		}

		code.overwrite( element.end, end, ')' );
	}
}
