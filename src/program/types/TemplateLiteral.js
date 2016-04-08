import Node from '../Node.js';

export default class TemplateLiteral extends Node {
	transpile () {
		const magicString = this.program.magicString;

		magicString.remove( this.start, this.start + 1 );
		magicString.remove( this.end - 1, this.end );

		const ordered = this.expressions.concat( this.quasis ).sort( ( a, b ) => a.start - b.start );

		ordered.forEach( ( node, i ) => {
			if ( node.type === 'TemplateElement' ) {
				if ( i ) magicString.insert( node.start, ' + ' );
				magicString.overwrite( node.start, node.end, JSON.stringify( node.value.cooked ) );

				// TODO overwrite string content (newlines, escaped quotes etc)
			} else {
				const parenthesise = node.type !== 'Identifier'; // TODO other cases where it's safe
				const open = parenthesise ? ( i ? ' + (' : '(' ) : ' + ';
				const close = parenthesise ? ')' : '';

				magicString.overwrite( node.start - 2, node.start, open );
				magicString.overwrite( node.end, node.end + 1, close );
			}
		});

		super.transpile();
	}
}
