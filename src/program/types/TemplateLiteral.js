import Node from '../Node.js';

export default class TemplateLiteral extends Node {
	transpile ( code ) {
		code.remove( this.start, this.start + 1 );
		code.remove( this.end - 1, this.end );

		const ordered = this.expressions.concat( this.quasis ).sort( ( a, b ) => a.start - b.start );

		let lastIndex = this.start;
		let closeParenthesis = false;

		ordered.forEach( ( node, i ) => {
			if ( node.type === 'TemplateElement' ) {
				const stringified = JSON.stringify( node.value.cooked );
				const replacement = `${closeParenthesis ? ')' : ''}${i ? ' + ' : ''}${stringified}`;
				code.overwrite( lastIndex, node.end, replacement );

				closeParenthesis = false;
			} else {
				const parenthesise = node.type !== 'Identifier'; // TODO other cases where it's safe
				const open = parenthesise ? ( i ? ' + (' : '(' ) : ' + ';

				code.overwrite( lastIndex, node.start, open );

				closeParenthesis = parenthesise;
			}

			lastIndex = node.end;
		});

		code.remove( lastIndex, this.end );

		super.transpile( code );
	}
}
