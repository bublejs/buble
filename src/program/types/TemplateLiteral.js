import Node from '../Node.js';

export default class TemplateLiteral extends Node {
	transpile ( code, transforms ) {
		if ( transforms.templateString && this.parent.type !== 'TaggedTemplateExpression' ) {
			code.remove( this.start, this.start + 1 );
			code.remove( this.end - 1, this.end );

			const ordered = this.expressions.concat( this.quasis ).sort( ( a, b ) => a.start - b.start );

			const parenthesise = this.parent.type !== 'AssignmentExpression' &&
			                     this.parent.type !== 'VariableDeclarator' &&
			                     ( this.parent.type !== 'BinaryExpression' || this.parent.operator !== '+' );

			if ( parenthesise ) code.insert( this.start, '(' );

			let lastIndex = this.start;
			let closeParenthesis = false;

			ordered.forEach( ( node, i ) => {
				if ( node.type === 'TemplateElement' ) {
					const stringified = JSON.stringify( node.value.cooked );
					const replacement = ( closeParenthesis ? ')' : '' ) + ( ( node.tail && !node.value.cooked.length && i !== 0 ) ? '' : `${i ? ' + ' : ''}${stringified}` );
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

			code.overwrite( lastIndex, this.end, parenthesise ? ')' : '' );
		}

		super.transpile( code, transforms );
	}
}
