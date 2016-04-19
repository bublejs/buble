import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class TaggedTemplateExpression extends Node {
	initialise ( transforms ) {
		if ( transforms.templateString && !transforms.dangerousTaggedTemplateString ) {
			throw new CompileError( this, 'Tagged template strings are not supported' );
		}

		super.initialise( transforms );
	}

	transpile ( code, transforms ) {
		if ( transforms.templateString && transforms.dangerousTaggedTemplateString ) {
			const endPoint = this.end;
			const funcName = this.tag.name;
			const expressions = this.quasi.expressions;
			const templateStrings = this.quasi.quasis.map(quasi => {
				code.remove( quasi.start, quasi.end );
				return JSON.stringify(quasi.value.cooked);
			});

			expressions.forEach((expression, i, arr) => {
				const length = arr.length;

				code.move( expression.start, expression.end, endPoint );
				if (i < length - 1) {
					code.insert(endPoint, ', ' );
				}
			});
			const startOutput = `${ funcName }([${ templateStrings.join(', ') }]` + (expressions.length > 0 ? ', ': '');

			code.overwrite( this.start, endPoint, startOutput );
			code.insert(endPoint, ');');
		}

		super.transpile( code, transforms );
	}
}
