import Node from '../Node.js';

export default class JSXOpeningElement extends Node {
	transpile ( code, transforms ) {
		code.overwrite( this.start, this.name.start, `${this.program.jsx}( ` );

		const html = this.name.type === 'JSXIdentifier' && this.name.name[0] === this.name.name[0].toLowerCase();
		if ( html ) code.insertRight( this.name.start, `'` );

		const len = this.attributes.length;
		let c = this.name.end;

		if ( len ) {
			let i;

			let hasSpread = false;
			for ( i = 0; i < len; i += 1 ) {
				if ( this.attributes[i].type === 'JSXSpreadAttribute' ) {
					hasSpread = true;
					break;
				}
			}

			let after;
			let before;
			if ( hasSpread ) {
				if ( len === 1 ) {
					before = html ? `',` : ',';
				} else {
					before = html ? `', Object.assign({},` : ', Object.assign({},';
					after = ')';
				}
			} else {
				before = html ? `', {` : ', {';
				after = ' }';
			}

			code.insertLeft( this.name.end, before );

			if ( after ) {
				code.insertLeft( this.attributes[ len - 1 ].end, after );
			}

			c = this.attributes[0].end;

			for ( i = 0; i < len; i += 1 ) {
				const attr = this.attributes[i];

				if ( i > 0 ) {
					code.overwrite( c, attr.start, ', ' );
				}

				if ( hasSpread && attr.type !== 'JSXSpreadAttribute' ) {
					code.insertLeft( attr.start, `{ ` );
					code.insertLeft( i === len - 1 ? attr.end - 1 : attr.end, ' }' );
				}

				c = attr.end;
			}
		} else {
			code.insertLeft( this.name.end, html ? `', null` : `, null` );
			c = this.name.end;
		}

		super.transpile( code, transforms );

		if ( this.selfClosing ) {
			code.overwrite( c, this.end, this.attributes.length ? `)` : ` )` );
		} else {
			code.remove( c, this.end );
		}
	}
}
