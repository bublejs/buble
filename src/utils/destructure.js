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

function destructureArrayPattern ( code, scope, node, ref, expr, statementGenerators ) {
	let c = node.start;

	node.elements.forEach( ( element, i ) => {
		if ( !element ) return;

		code.remove( c, element.start );
		_destructure( code, scope, element, scope.createIdentifier( `${ref}_${i}` ), `${ref}[${i}]`, statementGenerators );
		c = element.end;
	});

	code.remove( c, node.end );
}

function destructureObjectPattern ( code, scope, node, ref, expr, statementGenerators ) {
	let c = node.start;

	node.properties.forEach( prop => {
		let key = prop.key.name;
		let name;
		let declaration;

		switch ( prop.value.type ) {
			case 'Identifier':
				name = prop.value.name;
				declaration = scope.findDeclaration( name );
				if ( declaration ) name = declaration.name;

				code.remove( c, prop.value.start );
				c = prop.end;
				statementGenerators.push( ( start, prefix, suffix ) => {
					code.insertRight( prop.value.start, `${prefix}var ` );
					code.insertLeft( prop.value.end, ` = ${ref}.${key};${suffix}` );
					code.move( prop.value.start, prop.value.end, start );
				});
				break;

			case 'AssignmentPattern':
				name = prop.value.left.name;
				declaration = scope.findDeclaration( name );
				if ( declaration ) name = declaration.name;

				code.remove( c, prop.value.right.start );
				c = prop.end;
				statementGenerators.push( ( start, prefix, suffix ) => {
					code.insertRight( prop.value.right.start, `${prefix}var ${name} = ${ref}.${key}; if ( ${name} === void 0 ) ${name} = ` );
					code.move( prop.value.right.start, prop.value.right.end, start );
					code.insertLeft( prop.value.right.end, `;${suffix}` );
				});
				break;

			default:
				_destructure( code, scope, prop.value, scope.createIdentifier( `${ref}_${key}` ), `${ref}.${key}`, statementGenerators );
		}
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
