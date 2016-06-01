import Node from '../Node.js';

export default class ObjectExpression extends Node {
	transpile ( code, transforms ) {
		this.hasSpread = false;

		let i;
		for ( i = 0; i < this.properties.length; i += 1 ) {
			if ( this.properties[i].type === 'SpreadProperty' ) {
				this.hasSpread = true;
				break;
			}
		}

		if ( this.hasSpread ) {
			// remove brackets surrounding object
      const space = this.properties[0].type === 'SpreadProperty' ? 2 : 1;
			code.remove( this.start, this.start + space );
			code.remove( this.end - 1, this.end );

			// wrap the whole thing in Object.assign
			code.insertLeft( this.start, 'Object.assign({}, ');
			code.insertLeft( this.end, ')' );
		}

		super.transpile( code, transforms );
	}
}
