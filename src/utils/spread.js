export function isArguments ( node ) {
	return node.type === 'Identifier' && node.name === 'arguments';
}

export default function spread ( code, elements, start ) {
	let i = elements.length;
	let firstSpreadIndex = -1;

	while ( i-- ) {
		const element = elements[i];
		if ( element.type === 'SpreadElement' ) {
			if ( isArguments( element.argument ) ) {
				code.insertRight( element.argument.start, 'Array.apply( null, ' );
				code.insertLeft( element.argument.end, ' )' );
			}

			firstSpreadIndex = i;
		}
	}

	if ( firstSpreadIndex === -1 ) return false; // false indicates no spread elements

	let element = elements[ firstSpreadIndex ];
	const previousElement = elements[ firstSpreadIndex - 1 ];

	if ( !previousElement ) {
		code.remove( start, element.start );
		code.overwrite( element.end, elements[1].start, '.concat( ' );
	} else {
		code.overwrite( previousElement.end, element.start, ' ].concat( ' );
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

	return true; // true indicates some spread elements
}
