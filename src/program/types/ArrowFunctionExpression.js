import Node from '../Node.js';

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
				let parenthesised = false;
				let charIndex = this.start;
				while ( charIndex < this.params[0].start ) {
					if ( code.original[ charIndex ] === '(' ) {
						parenthesised = true;
						break;
					}
				}

				let start = 'function ';
				if ( !parenthesised ) start += '( ';

				code.insertRight( this.start, start );

				charIndex = this.params[ this.params.length -1 ].end;
				while ( code.original[ charIndex ] !== '=' ) charIndex += 1;

				// remove the `=> `
				code.overwrite( charIndex, this.body.start, parenthesised ? '' : ') ' );
			}
		}

		super.transpile( code, transforms );
	}
}
