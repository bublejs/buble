import wrap from './wrap.js';
import Node from './Node.js';
import Scope from './Scope.js';
import CompileError from '../utils/CompileError.js';

export default class BlockStatement extends Node {
	createScope () {
		this.parentIsFunction = /Function/.test( this.parent.type );
		this.isFunctionBlock = this.parentIsFunction || this.parent.type === 'Root';
		this.scope = new Scope({
			block: !this.isFunctionBlock,
			parent: this.parent.findScope( false )
		});

		if ( this.parentIsFunction ) {
			this.parent.params.forEach( node => {
				this.scope.addDeclaration( node, 'param' );
			});
		}
	}

	initialise ( transforms ) {
		this.thisAlias = null;
		this.argumentsAlias = null;
		this.defaultParameters = [];

		// normally the scope gets created here, during initialisation,
		// but in some cases (e.g. `for` statements), we need to create
		// the scope early, as it pertains to both the init block and
		// the body of the statement
		if ( !this.scope ) this.createScope();

		this.body.forEach( node => node.initialise( transforms ) );
	}

	findLexicalBoundary () {
		if ( this.type === 'Program' ) return this;
		if ( /^Function/.test( this.parent.type ) ) return this;

		return this.parent.findLexicalBoundary();
	}

	findScope ( functionScope ) {
		if ( functionScope && !this.isFunctionBlock ) return this.parent.findScope( functionScope );
		return this.scope;
	}

	getArgumentsAlias () {
		if ( !this.argumentsAlias ) {
			this.argumentsAlias = this.scope.createIdentifier( 'arguments' );
		}

		return this.argumentsAlias;
	}

	getThisAlias () {
		if ( !this.thisAlias ) {
			this.thisAlias = this.scope.createIdentifier( 'this' );
		}

		return this.thisAlias;
	}

	transpile ( code, transforms ) {
		const start = this.body[0] ? this.body[0].start : this.start + 1;

		const indentation = this.synthetic ?
			this.getIndentation() + code.getIndentString() :
			( this.body.length ? this.body[0].getIndentation() : '' );

		let addedStuff;
		let introStatementGenerators = [];

		if ( this.argumentsAlias ) {
			introStatementGenerators.push( ( prefix, suffix ) => {
				const assignment = `var ${this.argumentsAlias} = arguments;`;
				code.insertLeft( start, assignment );

				addedStuff = true;
			});
		}

		if ( this.thisAlias ) {
			introStatementGenerators.push( ( prefix, suffix ) => {
				if ( addedStuff ) code.insertLeft( start, `\n${indentation}` );
				const assignment = `var ${this.thisAlias} = this;`;
				code.insertLeft( start, assignment );
				addedStuff = true;
			});
		}

		if ( /Function/.test( this.parent.type ) ) {
			const params = this.parent.params;

			// default parameters
			if ( transforms.defaultParameter ) {
				params.filter( param => param.type === 'AssignmentPattern' ).forEach( param => {
					introStatementGenerators.push( ( prefix, suffix ) => {
						let lhs = addedStuff ? `\n${indentation}` : '';

						lhs += `if ( ${param.left.name} === void 0 ) ${param.left.name}`;
						code
							.insertRight( param.left.end, `${lhs}` )
							.move( param.left.end, param.right.end, start )
							.insertLeft( param.right.end, `;` );

						addedStuff = true;
					});
				});
			}

			// object pattern
			if ( transforms.parameterDestructuring ) {
				params.filter( param => param.type === 'ObjectPattern' ).forEach( param => {
					const ref = this.scope.createIdentifier( 'ref' );
					code.insertRight( param.start, ref );

					let c = param.start;

					param.properties.forEach( prop => {
						code.remove( c, prop.value.start );
						const key = prop.key.name;

						if ( prop.value.type === 'Identifier' ) {
							code.remove( prop.value.start, prop.value.end );

							const value = prop.value.name;
							const declaration = this.scope.findDeclaration( value );

							if ( declaration.instances.length === 1 ) {
								const instance = declaration.instances[0];
								code.overwrite( instance.start, instance.end, `${ref}.${key}` );
							} else {
								introStatementGenerators.push( ( prefix, suffix ) => {
									if ( addedStuff ) code.insertLeft( start, `\n${indentation}` );
									code.insertLeft( start, `var ${value} = ${ref}.${key};` );
									addedStuff = true;
								});
							}
						}

						else if ( prop.value.type === 'AssignmentPattern' ) {
							introStatementGenerators.push( ( prefix, suffix ) => {
								code.remove( prop.value.start, prop.value.right.start );

								//if ( addedStuff ) code.insertLeft( start, `\n${indentation}` );

								const value = prop.value.left.name;

								code
									.insertRight( prop.value.right.start, `${prefix}var ${ref}_${key} = ${ref}.${key}, ${value} = ${ref}_${key} === void 0 ? ` )
									.insertLeft( prop.value.right.end, ` : ${ref}_${key};${suffix}` )
									.move( prop.value.right.start, prop.value.right.end, start );

								addedStuff = true;
							});
						}

						else {
							throw new CompileError( prop, `Compound destructuring is not supported` );
						}

						c = prop.value.end;
					});

					code.remove( c, param.end );
				});

				// array pattern. TODO dry this out
				params.filter( param => param.type === 'ArrayPattern' ).forEach( param => {
					const ref = this.scope.createIdentifier( 'ref' );
					code.insertRight( param.start, ref );

					let c = param.start;

					param.elements.forEach( ( element, i ) => {
						code.remove( c, element.start );

						if ( addedStuff ) code.insertLeft( start, `\n${indentation}` );

						if ( element.type === 'Identifier' ) {
							code.remove( element.start, element.end );

							code.insertLeft( start, `var ${element.name} = ${ref}[${i}];` );
						} else if ( element.type === 'AssignmentPattern' ) {
							introStatementGenerators.push( ( prefix, suffix ) => {
								code.remove( element.start, element.right.start );

								const name = element.left.name;
								code
									.insertRight( element.right.start, `var ${ref}_${i} = ref[${i}], ${name} = ref_${i} === void 0 ? ` )
									.insertLeft( element.right.end, ` : ref_${i};` )
									.move( element.right.start, element.right.end, start );
							});
						}

						else {
							throw new CompileError( element, `Compound destructuring is not supported` );
						}

						c = element.end;
						addedStuff = true;
					});

					code.remove( c, param.end );
				});
			}

			// rest parameter
			if ( transforms.spreadRest ) {
				const lastParam = params[ params.length - 1 ];
				if ( lastParam && lastParam.type === 'RestElement' ) {
					introStatementGenerators.push( ( prefix, suffix ) => {
						const penultimateParam = params[ params.length - 2 ];

						if ( penultimateParam ) {
							code.remove( penultimateParam ? penultimateParam.end : lastParam.start, lastParam.end );
						} else {
							let start = lastParam.start, end = lastParam.end; // TODO https://gitlab.com/Rich-Harris/buble/issues/8

							while ( /\s/.test( code.original[ start - 1 ] ) ) start -= 1;
							while ( /\s/.test( code.original[ end ] ) ) end += 1;

							code.remove( start, end );
						}

						if ( addedStuff ) code.insertLeft( start, `\n${indentation}` );

						const name = lastParam.argument.name;
						const len = this.scope.createIdentifier( 'len' );
						const count = params.length - 1;

						if ( count ) {
							code.insertLeft( start, `var ${name} = [], ${len} = arguments.length - ${count};\n${indentation}while ( ${len}-- > 0 ) ${name}[ ${len} ] = arguments[ ${len} + ${count} ];` );
						} else {
							code.insertLeft( start, `var ${name} = [], ${len} = arguments.length;\n${indentation}while ( ${len}-- ) ${name}[ ${len} ] = arguments[ ${len} ];` );
						}

						addedStuff = true;
					});
				}
			}
		}

		introStatementGenerators.forEach( fn => {
			fn( `\n${indentation}`, '' );
		});

		if ( transforms.letConst && this.isFunctionBlock ) {
			Object.keys( this.scope.blockScopedDeclarations ).forEach( name => {
				const declarations = this.scope.blockScopedDeclarations[ name ];

				for ( let i = 0; i < declarations.length; i += 1 ) {
					const declaration = declarations[i];
					let cont = false; // TODO implement proper continue...

					if ( declaration.kind === 'for.let' ) {
						// special case
						const forStatement = declaration.node.findNearest( 'ForStatement' );

						if ( forStatement.shouldRewriteAsFunction ) {
							const outerAlias = this.scope.createIdentifier( name );
							const innerAlias = forStatement.reassigned[ name ] ?
								this.scope.createIdentifier( name ) :
								name;

							declaration.name = outerAlias;

							forStatement.aliases[ name ] = {
								outer: outerAlias,
								inner: innerAlias
							};

							for ( const identifier of declaration.instances ) {
								const alias = forStatement.body.contains( identifier ) ?
									innerAlias :
									outerAlias;

								if ( name !== alias ) {
									code.overwrite( identifier.start, identifier.end, alias, true );
								}
							}

							cont = true;
						}
					}

					if ( !cont ) {
						const alias = this.scope.createIdentifier( name );

						if ( name !== alias ) {
							declaration.name = alias;

							for ( const identifier of declaration.instances ) {
								identifier.rewritten = true;
								code.overwrite( identifier.start, identifier.end, alias, true );
							}
						}
					}
				}
			});
		}

		super.transpile( code, transforms );

		if ( this.synthetic && this.parent.type === 'ArrowFunctionExpression' ) {
			code.insertRight( this.body[0].start, 'return ' );
		}

		if ( addedStuff && this.body.length ) {
			code.insertRight( this.body[0].start, `\n\n${indentation}` );
		}
	}
}
