import Node from '../Node.js';

export default class ObjectExpression extends Node {
	transpile ( code, transforms ) {
		super.transpile( code, transforms );

		let hasSpread = false;

		for ( let prop of this.properties ) {
			if ( prop.type === 'SpreadProperty' ) {
				hasSpread = true;
				break;
			}
		}

		if ( hasSpread ) {
			// enclose run of non-spread properties in curlies
			let i = this.properties.length;
			while ( i-- ) {
				const prop = this.properties[i];


				if ( prop.type === 'Property' ) {
					const lastProp = this.properties[ i - 1 ];
					const nextProp = this.properties[ i + 1 ];

					if ( !lastProp || lastProp.type !== 'Property' ) {
						code.insertRight( prop.start, '{' );
					}

					if ( !nextProp || nextProp.type !== 'Property' ) {
						code.insertLeft( prop.end, '}' );
					}
				}
			}

			// wrap the whole thing in Object.assign
			code.overwrite( this.start, this.properties[0].start, `${this.program.objectSpreadRest}({}, `);
			code.overwrite( this.properties[ this.properties.length - 1 ].end, this.end, ')' );
		}
	}
}
