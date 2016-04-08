import Node from '../Node.js';

export default class TemplateLiteral extends Node {
	transpile () {
		const magicString = this.program.magicString;

		magicString.remove( this.start, this.start + 1 );
		magicString.remove( this.end - 1, this.end );

		const ordered = this.expressions.concat( this.quasis ).sort( ( a, b ) => a.start - b.start );

		let lastIndex = this.start;
		let closeParenthesis = false;

		ordered.forEach( ( node, i ) => {
			if ( node.type === 'TemplateElement' ) {
				const stringified = JSON.stringify( node.value.cooked );
				const replacement = `${closeParenthesis ? ')' : ''}${i ? ' + ' : ''}${stringified}`;
				magicString.overwrite( lastIndex, node.end, replacement );

				closeParenthesis = false;
			} else {
				const parenthesise = node.type !== 'Identifier'; // TODO other cases where it's safe
				const open = parenthesise ? ( i ? ' + (' : '(' ) : ' + ';

				magicString.overwrite( lastIndex, node.start, open );

				closeParenthesis = parenthesise;
			}

			lastIndex = node.end;
		});

		magicString.remove( lastIndex, this.end );

		super.transpile();
	}
}
