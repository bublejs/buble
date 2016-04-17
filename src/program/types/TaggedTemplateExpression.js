import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class TaggedTemplateExpression extends Node {
	initialise ( transforms ) {
		this.quasi.skipTranspilation = true;
	}

	transpile ( code, transforms ) {
		if ( transforms.templateString ) {
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
