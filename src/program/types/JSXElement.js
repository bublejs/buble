import Node from '../Node.js';

export default class JSXElement extends Node {
	transpile ( code, transforms ) {
		code.insertLeft( this.end, `)` );

		super.transpile( code, transforms );

		const children = this.children.filter( child => {
			return child.type === 'JSXElement' || /\S/.test( child.value );
		});

		if ( children.length ) {
			code.insertLeft( this.openingElement.end, ',' );

			for ( let i = 0; i < children.length - 1; i += 1 ) {
				const child = children[i];
				code.insertLeft( child.end, ',' );
			}
		}
	}
}
