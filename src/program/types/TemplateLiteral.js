import Node from '../Node.js';

export default class TemplateLiteral extends Node {
	transpile () {
		this.program.magicString.remove( this.start, this.start + 1 );
		this.program.magicString.remove( this.end - 1, this.end );

		const ordered = this.expressions.concat( this.quasis ).sort( ( a, b ) => a.start - b.start );

		let lastType;
		ordered.forEach( ( node, i ) => {
			if ( node.type === 'TemplateElement' ) {
				this.program.magicString.insert( node.start, i ? ` + '` : `'` );
				this.program.magicString.insert( node.end, `'` );

				// TODO overwrite string content (newlines, escaped quotes etc)
			} else {
				const parenthesise = node.type !== 'Identifier'; // TODO other cases where it's safe
				const open = parenthesise ? ( i ? ' + (' : '(' ) : ' + ';
				const close = parenthesise ? ')' : '';

				this.program.magicString.overwrite( node.start - 2, node.start, open );
				this.program.magicString.overwrite( node.end, node.end + 1, close );
			}

			lastType = node.type;
		});

		super.transpile();
	}
}
