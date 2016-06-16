const handlers = {
	ArrayPattern: destructureArrayPattern,
	ObjectPattern: destructureObjectPattern,
	AssignmentPattern: destructureAssignmentPattern,
	Identifier: destructureIdentifier
};

export default function destructure ( code, scope, node, ref, statementGenerators ) {
	_destructure( code, scope, node, ref, ref, statementGenerators );
}

function _destructure ( code, scope, node, ref, expr, statementGenerators ) {
	const handler = handlers[ node.type ];
	if ( !handler ) throw new Error( `not implemented: ${node.type}` );

	handler( code, scope, node, ref, expr, statementGenerators );
}

function destructureIdentifier ( code, scope, node, ref, expr, statementGenerators ) {
	statementGenerators.push( ( start, prefix, suffix ) => {
		code.insertRight( node.start, `${prefix}var ` );
		code.insertLeft( node.end, ` = ${expr};${suffix}` );
		code.move( node.start, node.end, start );
	});
}

function handleProperty ( code, scope, c, node, value, statementGenerators ) {
	switch ( node.type ) {
		case 'Identifier':
			code.remove( c, node.start );
			statementGenerators.push( ( start, prefix, suffix ) => {
				code.insertRight( node.start, `${prefix}var ` );
				code.insertLeft( node.end, ` = ${value};${suffix}` );
				code.move( node.start, node.end, start );
			});
			break;

		case 'AssignmentPattern':
			let name = node.left.name;
			const declaration = scope.findDeclaration( name );
			if ( declaration ) name = declaration.name;

			code.remove( c, node.right.start );
			statementGenerators.push( ( start, prefix, suffix ) => {
				code.insertRight( node.right.start, `${prefix}var ${name} = ${value}; if ( ${name} === void 0 ) ${name} = ` );
				code.move( node.right.start, node.right.end, start );
				code.insertLeft( node.right.end, `;${suffix}` );
			});
			break;

		default:
			console.log( 'node.type', node.type )
			_destructure( code, scope, node, scope.createIdentifier( `${ref}_${i}` ), `${ref}[${i}]`, statementGenerators );
	}
}

function destructureArrayPattern ( code, scope, node, ref, expr, statementGenerators ) {
	let c = node.start;

	node.elements.forEach( ( element, i ) => {
		if ( !element ) return;

		handleProperty( code, scope, c, element, `${ref}[${i}]`, statementGenerators );
		c = element.end;
	});

	code.remove( c, node.end );
}

function destructureObjectPattern ( code, scope, node, ref, expr, statementGenerators ) {
	let c = node.start;

	node.properties.forEach( prop => {
		handleProperty( code, scope, c, prop.value, `${ref}.${prop.key.name}`, statementGenerators );
		c = prop.end;
	});

	code.remove( c, node.end );
}

function destructureAssignmentPattern ( code, scope, node, ref, expr, statementGenerators ) {
	const isIdentifier = node.left.type === 'Identifier';
	const name = isIdentifier ? node.left.name : ref;

	statementGenerators.push( ( start, prefix, suffix ) => {
		code.insertRight( node.left.end, `${prefix}if ( ${name} === void 0 ) ${name}` );
		code.move( node.left.end, node.right.end, start );
		code.insertLeft( node.right.end, `;${suffix}` );
	});

	if ( !isIdentifier ) {
		_destructure( code, scope, node.left, ref, expr, statementGenerators );
	}
}
