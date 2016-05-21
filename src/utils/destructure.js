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

function handlePattern ( code, node, tmp, expr, statementGenerators ) {
	if ( node.type === 'Identifier' ) {
		statementGenerators.push( ( start, prefix, suffix ) => {
			code.insertRight( node.start, `${prefix}var ` );
			code.insertLeft( node.end, ` = ${expr};${suffix}` );
			code.move( node.start, node.end, start );
		});
	} else if ( node.type === 'AssignmentPattern' ) {
		statementGenerators.push( ( start, prefix, suffix ) => {
			code.remove( node.start, node.right.start );

			const name = node.left.name;
			code
				.insertRight( node.right.start, `${prefix}var ${tmp} = ${expr}, ${name} = ${tmp} === void 0 ? ` )
				.insertLeft( node.right.end, ` : ${tmp};${suffix}` )
				.move( node.right.start, node.right.end, start );
		});
	} else {
		throw new Error( 'Compound destructuring is not supported' );
	}
}

function destructureArrayPattern ( code, scope, node, ref, statementGenerators ) {
	let c = node.start;

	node.elements.forEach( ( element, i ) => {
		if ( !element ) return;

		code.remove( c, element.start );
		handlePattern( code, element, scope.createIdentifier( `${ref}_${i}` ), `${ref}[${i}]`, statementGenerators );
		c = element.end;
	});

	code.remove( c, node.end );
}

function destructureObjectPattern ( code, scope, node, ref, statementGenerators ) {
	let c = node.start;

	node.properties.forEach( prop => {
		const key = prop.key.name;

		code.remove( c, prop.value.start );
		handlePattern( code, prop.value, scope.createIdentifier( `${ref}_${key}` ), `${ref}.${key}`, statementGenerators );
		c = prop.end;
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
