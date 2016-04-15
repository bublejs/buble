import Node from '../Node.js';
import { find } from '../../utils/array.js';

export default class ArrowFunctionExpression extends Node {
	initialise ( transforms ) {
		this.body.createScope();
		super.initialise( transforms );
	}

	transpile ( code, transforms ) {
		if ( transforms.arrow ) {
			if ( this.params.length === 0 ) {
				code.overwrite( this.start, this.body.start, 'function () ' );
			} else {
				code.insert( this.start, 'function ' );

				let parenthesised = false;
				let charIndex = this.start;
				while ( charIndex < this.params[0].start ) {
					if ( code.original[ charIndex ] === '(' ) {
						parenthesised = true;
						break;
					}
				}

				if ( !parenthesised ) {
					code.insert( this.start, '( ' );
				}

				charIndex = this.params[ this.params.length -1 ].end;
				while ( code.original[ charIndex ] !== '=' ) charIndex += 1;

				// remove the `=> `
				code.overwrite( charIndex, this.body.start, parenthesised ? '' : ') ' );
			}
		}

		if ( this.body.synthetic ) {
			if ( find( this.params, param => param.type === 'RestElement' || /Pattern/.test( param.type ) ) ) {
				const indentation = this.getIndentation();
				code.insert( this.body.start, `{\n${indentation}${code.getIndentString()}` );
				super.transpile( code, transforms );
				code.insert( this.body.body[0].start, 'return ' );
				code.insert( this.body.end, `;\n${indentation}}` );
			}

			else if ( transforms.arrow ) {
				code.insert( this.body.start, `{ return ` );
				super.transpile( code, transforms );
				code.insert( this.body.end, `; }` );
			}
		}

		else {
			super.transpile( code, transforms );
		}
	}
}
