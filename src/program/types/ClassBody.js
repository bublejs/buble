import Node from '../Node.js';

// TODO this code is pretty wild, tidy it up
export default class ClassBody extends Node {
	transpile ( code, inFunctionExpression ) {
		const name = this.parent.name;
		const superName = this.parent.superClass && this.parent.superClass.name;

		const indentStr = code.getIndentString();
		let indentation = this.getIndentation() + ( inFunctionExpression ? indentStr : '' );

		const constructorIndex = this.body.findIndex( node => node.kind === 'constructor' );
		const constructor = this.body[ constructorIndex ];

		if ( this.body.length ) {
			code.remove( this.start, this.body[0].start );
			code.remove( this.body[ this.body.length - 1 ].end, this.end );
		} else {
			code.remove( this.start, this.end );
		}

		if ( constructor ) {
			const previousMethod = this.body[ constructorIndex - 1 ];
			const nextMethod = this.body[ constructorIndex + 1 ];

			// ensure constructor is first
			if ( constructorIndex > 0 ) {
				code.remove( previousMethod.end, constructor.start );
				code.move( constructor.start, nextMethod ? nextMethod.start : this.end - 1, this.body[0].start );
			}

			if ( !inFunctionExpression ) code.insert( constructor.end, ';' );

			if ( constructorIndex > 0 ) {
				if ( nextMethod ) {
					code.insert( nextMethod.start, `\n\n${indentation}` );
				} else {
					code.insert( constructor.end, `\n\n${indentation}` );
				}
			}
		} else {
			const fn = `function ${name} () {` + ( superName ?
				`\n${indentation}${indentStr}${superName}.apply(this, arguments);\n${indentation}}` :
				`}` ) + ( inFunctionExpression ? '' : ';' ) + ( this.body.length ? `\n\n${indentation}` : '' );
			code.insert( this.start, fn );
		}

		if ( this.parent.superClass ) {
			let inheritanceBlock = `${name}.prototype = Object.create( ${superName} && ${superName}.prototype );\n${indentation}${name}.prototype.constructor = ${name};`;

			if ( constructor ) {
				code.insert( constructor.end, `\n\n${indentation}` + inheritanceBlock );
			} else {
				code.insert( this.start, inheritanceBlock + `\n\n${indentation}` );
			}
		}

		this.body.forEach( method => {
			if ( method.kind === 'constructor' ) {
				code.overwrite( method.key.start, method.key.end, `function ${name}` );
				return;
			}

			if ( method.static ) code.remove( method.start, method.start + 7 );

			const lhs = method.static ?
				`${name}.${method.key.name}` :
				`${name}.prototype.${method.key.name}`;

			code.insert( method.start, `${lhs} = function ` );
			code.insert( method.end, ';' );

			// prevent function name shadowing an existing declaration
			const scope = this.findScope( false );
			if ( scope.contains( method.key.name ) ) {
				code.overwrite( method.key.start, method.key.end, scope.createIdentifier( method.key.name ), true );
			}
		});

		super.transpile( code );
	}
}
