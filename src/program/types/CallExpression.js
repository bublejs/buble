import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class CallExpression extends Node {
	transpile ( code ) {
		const lastArgument = this.arguments[ this.arguments.length - 1 ];
		if ( lastArgument && lastArgument.type === 'SpreadElement' ) {
			// TODO expression callee (`(a || b)(...values)`)

			let context;

			if ( this.callee.type === 'MemberExpression' ) {
				if ( this.callee.object.type === 'Identifier' ) {
					context = this.callee.object.name;
				} else {
					throw new CompileError( 'Calling members of expressions with a spread operator is not currently supported' );
				}
			} else {
				context = 'void 0';
			}

			code.insert( this.callee.end, '.apply' );

			const penultimateArgument = this.arguments[ this.arguments.length - 2 ];

			if ( penultimateArgument ) {
				code.insert( this.arguments[0].start, `${context}, [ ` );
				code.overwrite( penultimateArgument.end, lastArgument.start, ` ].concat( ` );
				code.insert( lastArgument.end, ` )` );
			} else {
				code.insert( lastArgument.start, `${context}, ` );
			}

			code.remove( lastArgument.start, lastArgument.start + 3 );
		}

		super.transpile( code );
	}
}
