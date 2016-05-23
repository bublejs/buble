export function isArguments ( node ) {
	return node.type === 'Identifier' && node.name === 'arguments';
}

export default function spread ( code, elements, start ) {
	let i = elements.length;
	let firstSpreadIndex = -1;

	let hasNonSpreadElements = false;
	let args = [];

	while ( i-- ) {
		const element = elements[i];
		if ( element.type === 'SpreadElement' ) {
			if ( isArguments( element.argument ) ) args.push( element.argument );
			firstSpreadIndex = i;
		}
	}

	if ( firstSpreadIndex === -1 ) return false; // false indicates no spread elements

	if ( firstSpreadIndex > 0 ) hasNonSpreadElements = true;
	if ( hasNonSpreadElements ) {
		args.forEach( arg => {
			code.insertRight( arg.start, 'Array.apply( null, ' );
			code.insertLeft( arg.end, ' )' );
		});
	} else {
		args.forEach( arg => {
			code.insertRight( arg.start, '( arguments.length === 0 ? [ arguments[0] ] : Array.apply( null, ' );
			code.insertLeft( arg.end, ' ) )' );
		});
	}

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
