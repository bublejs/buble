const handlers = {
	ArrayPattern: destructureArrayPattern,
	ObjectPattern: destructureObjectPattern,
	AssignmentPattern: destructureAssignmentPattern
};

export default function destructure ( code, scope, node, ref, statementGenerators ) {
	const handler = handlers[ node.type ];
	if ( !handler ) throw new Error( `not implemented: ${node.type}` );

	handler( code, scope, node, ref, statementGenerators );
}

function destructureArrayPattern ( code, scope, node, ref, statementGenerators ) {
	let c = node.start;

	node.elements.forEach( ( element, i ) => {
		if ( element.type === 'Identifier' ) {
			code.remove( c, element.end );

			statementGenerators.push( ( start, prefix, suffix ) => {
				const value = element.name;
				code.insertLeft( start, `${prefix}var ${value} = ${ref}[${i}];${suffix}` );
			});
		} else if ( element.type === 'AssignmentPattern' ) {
			code.remove( c, element.start );

			statementGenerators.push( ( start, prefix, suffix ) => {
				code.remove( element.start, element.right.start );

				const name = element.left.name;
				code
					.insertRight( element.right.start, `${prefix}var ${ref}_${i} = ref[${i}], ${name} = ref_${i} === void 0 ? ` )
					.insertLeft( element.right.end, ` : ref_${i};${suffix}` )
					.move( element.right.start, element.right.end, start );
			});

			c = element.end;
		} else {
			throw new Error( 'Compound destructuring is not supported' );
		}
	});

	code.remove( c, node.end );
}

function destructureObjectPattern ( code, scope, node, ref, statementGenerators ) {
	let c = node.start;

	node.properties.forEach( prop => {
		const key = prop.key.name;

		if ( prop.value.type === 'Identifier' ) {
			code.remove( c, prop.end );

			statementGenerators.push( ( start, prefix, suffix ) => {
				const value = prop.value.name;
				code.insertLeft( start, `${prefix}var ${value} = ${ref}.${key};${suffix}` );
			});
		} else if ( prop.value.type === 'AssignmentPattern' ) {
			code.remove( c, prop.value.start );

			statementGenerators.push( ( start, prefix, suffix ) => {
				code.remove( prop.value.start, prop.value.right.start );

				const value = prop.value.left.name;

				code
					.insertRight( prop.value.right.start, `${prefix}var ${ref}_${key} = ${ref}.${key}, ${value} = ${ref}_${key} === void 0 ? ` )
					.insertLeft( prop.value.right.end, ` : ${ref}_${key};${suffix}` )
					.move( prop.value.right.start, prop.value.right.end, start );
			});

			c = prop.end;
		} else {
			throw new Error( 'Compound destructuring is not supported' );
		}
	});

	code.remove( c, node.end );
}

function destructureAssignmentPattern ( code, scope, node, ref, statementGenerators ) {
	const isIdentifier = node.left.type === 'Identifier';
	const name = isIdentifier ? node.left.name : ref;

	statementGenerators.push( ( start, prefix, suffix ) => {
		code.insertRight( node.left.end, `${prefix}if ( ${name} === void 0 ) ${name}` );
		code.move( node.left.end, node.right.end, start );
		code.insertLeft( node.right.end, `;${suffix}` );
	});

	if ( !isIdentifier ) {
		destructure( code, scope, node.left, ref, statementGenerators );
	}
}
