import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class CallExpression extends Node {
	transpile ( code, transforms ) {
		if ( transforms.spreadRest ) {
			const lastArgument = this.arguments[ this.arguments.length - 1 ];
			if ( lastArgument && lastArgument.type === 'SpreadElement' ) {
				let context;

				if ( this.callee.type === 'MemberExpression' ) {
					if ( this.callee.object.type === 'Identifier' ) {
						context = this.callee.object.name;
					} else {
						const statement = this.callee.object;
						const i0 = statement.getIndentation();
						context = this.findScope( true ).createIdentifier( 'ref' );
						code.insertRight( statement.start, `var ${context} = ` );
						code.insertLeft( statement.end, `;\n${i0}${context}` );
					}
				} else {
					context = 'void 0';
				}

				code.insertLeft( this.callee.end, '.apply' );

				const penultimateArgument = this.arguments[ this.arguments.length - 2 ];

				if ( penultimateArgument ) {
					code.insertRight( this.arguments[0].start, `${context}, [ ` );
					code.overwrite( penultimateArgument.end, lastArgument.start, ` ].concat( ` );
					code.insertLeft( lastArgument.end, ` )` );
				} else {
					code.insertRight( lastArgument.start, `${context}, ` );
				}

				code.remove( lastArgument.start, lastArgument.start + 3 );
			}
		}

		super.transpile( code, transforms );
	}
}
