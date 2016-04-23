export default function extractNames ( node ) {
	const names = [];
	extractors[ node.type ]( names, node );
	return names;
}

const extractors = {
	Identifier ( names, param ) {
		names.push( param.name );
	},

	ObjectPattern ( names, param ) {
		for ( const prop of param.properties ) {
			extractors[ prop.value.type ]( names, prop.value );
		}
	},

	ArrayPattern ( names, param ) {
		for ( const element of param.elements )  {
			if ( element ) extractors[ element.type ]( names, element );
		}
	},

	RestElement ( names, param ) {
		extractors[ param.argument.type ]( names, param.argument );
	},

	AssignmentPattern ( names, param ) {
		extractors[ param.left.type ]( names, param.left );
	}
};
