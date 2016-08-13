import Node from '../Node.js';
import spread, { isArguments } from '../../utils/spread.js';

export default class NewExpression extends Node {
	initialise ( transforms ) {
		if ( transforms.spreadRest && this.arguments.length ) {
			const lexicalBoundary = this.findLexicalBoundary();

			let i = this.arguments.length;
			while ( i-- ) {
				const arg = this.arguments[i];
				if ( arg.type === 'SpreadElement' && isArguments( arg.argument ) ) {
					this.argumentsArrayAlias = lexicalBoundary.getArgumentsArrayAlias();
				}
			}
		}

		super.initialise( transforms );
	}

	transpile ( code, transforms ) {
		if ( transforms.spreadRest && this.arguments.length ) {
			const firstArgument = this.arguments[0];
			const isNew = true;
			let hasSpreadElements = spread( code, this.arguments, firstArgument.start, this.argumentsArrayAlias, isNew );

			if ( hasSpreadElements ) {
				code.insertLeft( this.start + 'new'.length, ' (Function.prototype.bind.apply(' );
				code.overwrite( this.callee.end, firstArgument.start, ', ' );
				code.insertLeft( firstArgument.start, "[ null ].concat( " );
				code.insertRight( this.end, ' ))' );
			}
		}

		super.transpile( code, transforms );
	}
}
