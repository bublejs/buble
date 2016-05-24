import Node from '../Node.js';

export default class JSXOpeningElement extends Node {
	transpile ( code, transforms ) {
		code.overwrite( this.start, this.name.start, `React.createElement( ` );

		const html = this.name.type === 'JSXIdentifier' && this.name.name[0] === this.name.name[0].toLowerCase();
		if ( html ) code.insertRight( this.name.start, `'` );

		const len = this.attributes.length;
		let c = this.name.end;

		if ( len ) {
			code.insertLeft( this.name.end, html ? `', {` : `, {` );
			code.insertLeft( this.attributes[ len - 1 ].end, ' }' );

			let i;
			c = this.attributes[0].end;

			for ( i = 1; i < len; i += 1 ) {
				code.overwrite( c, this.attributes[i].start, ', ' );
				c = this.attributes[i].end;
			}
		} else {
			code.insertLeft( this.name.end, `', null` );
			c = this.name.end;
		}

		code.remove( c, this.end );
		super.transpile( code, transforms );
	}
}
