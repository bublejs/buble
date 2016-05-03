import Node from '../Node.js';
import { findIndex } from '../../utils/array.js';

// TODO this code is pretty wild, tidy it up
export default class ClassBody extends Node {
	transpile ( code, transforms, inFunctionExpression, superName ) {
		if ( transforms.classes ) {
			const name = this.parent.name;

			const indentStr = code.getIndentString();
			let indentation = this.getIndentation() + ( inFunctionExpression ? indentStr : '' );

			const constructorIndex = findIndex( this.body, node => node.kind === 'constructor' );
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

			const scope = this.findScope( false );

			let prototypeGettersAndSetters = [];
			let staticGettersAndSetters = [];
			let prototypeAccessors;
			let staticAccessors;

			this.body.forEach( method => {
				if ( method.kind === 'constructor' ) {
					code.overwrite( method.key.start, method.key.end, `function ${name}` );
					return;
				}

				if ( method.static ) code.remove( method.start, method.start + 7 );

				const isAccessor = method.kind !== 'method';
				let lhs;

				if ( isAccessor ) {
					code.remove( method.start, method.key.end );

					if ( method.static ) {
						if ( !~staticGettersAndSetters.indexOf( method.key.name ) ) staticGettersAndSetters.push( method.key.name );
						if ( !staticAccessors ) staticAccessors = scope.createIdentifier( 'staticAccessors' );

						lhs = `${staticAccessors}.${method.key.name}.${method.kind}`;
					} else {
						if ( !~prototypeGettersAndSetters.indexOf( method.key.name ) ) prototypeGettersAndSetters.push( method.key.name );
						if ( !prototypeAccessors ) prototypeAccessors = scope.createIdentifier( 'prototypeAccessors' );

						lhs = `${prototypeAccessors}.${method.key.name}.${method.kind}`;
					}
				} else {
					lhs = method.static ?
						`${name}.${method.key.name}` :
						`${name}.prototype.${method.key.name}`;
				}

				code.insert( method.start, `${lhs} = function` + ( method.value.generator ? '*' : '' ) + ( isAccessor ? '' : ' ' ) );
				code.insert( method.end, ';' );

				if ( method.value.generator ) code.remove( method.start, method.key.start );

				// prevent function name shadowing an existing declaration
				if ( scope.contains( method.key.name ) ) {
					code.overwrite( method.key.start, method.key.end, scope.createIdentifier( method.key.name ), true );
				}
			});

			if ( prototypeGettersAndSetters.length || staticGettersAndSetters.length ) {
				let intro = [];
				let outro = [];

				if ( prototypeGettersAndSetters.length ) {
					intro.push( `var ${prototypeAccessors} = { ${prototypeGettersAndSetters.map( name => `${name}: {}` ).join( ',' )} };` );
					outro.push( `Object.defineProperties( ${name}.prototype, ${prototypeAccessors} );` );
				}

				if ( staticGettersAndSetters.length ) {
					intro.push( `var ${staticAccessors} = { ${staticGettersAndSetters.map( name => `${name}: {}` ).join( ',' )} };` );
					outro.push( `Object.defineProperties( ${name}, ${staticAccessors} );` );
				}

				if ( constructor ) {
					code.insert( constructor.end, `\n\n${indentation}${intro.join( `\n${indentation}` )}` );
				} else {
					code.insert( this.start, `${intro.join( `\n${indentation}` )}\n\n${indentation}` );
				}

				code.insert( this.end, `\n\n${indentation}${outro.join( `\n${indentation}` )}` );
			}
		}

		super.transpile( code, transforms );
	}
}
