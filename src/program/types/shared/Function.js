import Node from '../../Node.js';
import extractNames from '../../extractNames.js';
import CompileError from '../../../utils/CompileError.js';

export default class Function extends Node {
	transpile ( code, transforms ) {
		const { body, params } = this;
		const scope = body.scope;

		// default parameters
		if ( transforms.defaultParameter ) {
			params.filter( param => param.type === 'AssignmentPattern' ).forEach( param => {
				body.insertStatement([
					`if ( ${param.left.name} === void 0 ) ${param.left.name}`,
					[ param.left.end, param.right.end ],
					';'
				]);
			});
		}

		// object pattern
		if ( transforms.parameterDestructuring ) {
			params.filter( param => param.type === 'ObjectPattern' ).forEach( param => {
				const ref = scope.createIdentifier( 'ref' );
				code.insert( param.start, ref );

				let lastIndex = param.start;

				param.properties.forEach( prop => {
					code.remove( lastIndex, prop.value.start );

					const key = prop.key.name;

					if ( prop.value.type === 'Identifier' ) {
						code.remove( prop.value.start, prop.value.end );
						lastIndex = prop.value.end;

						const value = prop.value.name;
						const declaration = scope.findDeclaration( value );

						if ( declaration.instances.length === 1 ) {
							const instance = declaration.instances[0];
							code.overwrite( instance.start, instance.end, `${ref}.${key}` );
						} else {
							this.body.insertStatement([ `var ${value} = ${ref}.${key};` ]);
						}
					} else if ( prop.value.type === 'AssignmentPattern' ) {
						code.remove( prop.value.start, prop.value.right.start );
						lastIndex = prop.value.right.end;

						const value = prop.value.left.name;

						this.body.insertStatement([
							`var ${ref}_${key} = ${ref}.${key}, ${value} = ${ref}_${key} === void 0 ? `,
							[ prop.value.right.start, prop.value.right.end ],
							` : ${ref}_${key};`
						]);
					}

					else {
						throw new CompileError( prop, `Compound destructuring is not supported` );
					}

					lastIndex = prop.end;
				});

				code.remove( lastIndex, param.end );
			});

			// array pattern. TODO dry this out
			params.filter( param => param.type === 'ArrayPattern' ).forEach( param => {
				const ref = scope.createIdentifier( 'ref' );
				code.insert( param.start, ref );

				let lastIndex = param.start;

				param.elements.forEach( ( element, i ) => {
					code.remove( lastIndex, element.start );

					if ( element.type === 'Identifier' ) {
						code.remove( element.start, element.end );
						lastIndex = element.end;

						this.body.insertStatement([ `var ${element.name} = ${ref}[${i}];` ]);
					} else if ( element.type === 'AssignmentPattern' ) {
						code.remove( element.start, element.right.start );
						lastIndex = element.right.end;

						const name = element.left.name;

						this.body.insertStatement([
							`var ${ref}_${i} = ref[${i}], ${name} = ref_${i} === void 0 ? `,
							[ element.right.start, element.right.end ],
							` : ref_${i};`
						]);
					}

					else {
						throw new CompileError( element, `Compound destructuring is not supported` );
					}

					lastIndex = element.end;
				});

				code.remove( lastIndex, param.end );
			});
		}

		// rest parameter
		if ( transforms.spreadRest ) {
			const lastParam = params[ params.length - 1 ];
			if ( lastParam && lastParam.type === 'RestElement' ) {
				const penultimateParam = params[ params.length - 2 ];

				if ( penultimateParam ) {
					code.remove( penultimateParam ? penultimateParam.end : lastParam.start, lastParam.end );
				} else {
					let start = lastParam.start, end = lastParam.end; // TODO https://gitlab.com/Rich-Harris/buble/issues/8

					while ( /\s/.test( code.original[ start - 1 ] ) ) start -= 1;
					while ( /\s/.test( code.original[ end ] ) ) end += 1;

					code.remove( start, end );
				}

				const name = lastParam.argument.name;
				const len = scope.createIdentifier( 'len' );
				const count = params.length - 1;

				const indentation = this.getIndentation() + code.getIndentString();

				body.insertStatement([
					count ?
						`var ${name} = [], ${len} = arguments.length - ${count};\n${indentation}while ( ${len}-- > 0 ) ${name}[ ${len} ] = arguments[ ${len} + ${count} ];` :
						`var ${name} = [], ${len} = arguments.length;\n${indentation}while ( ${len}-- ) ${name}[ ${len} ] = arguments[ ${len} ];`
				]);
			}
		}

		super.transpile( code, transforms );
	}
}
