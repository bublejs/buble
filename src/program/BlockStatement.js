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

		let addedStuff = false;

		if ( this.argumentsAlias ) {
			const assignment = `var ${this.argumentsAlias} = arguments;`;
			code.insert( start, assignment );
			addedStuff = true;
		}

		if ( this.thisAlias ) {
			if ( addedStuff ) code.insert( start, `\n${indentation}` );
			const assignment = `var ${this.thisAlias} = this;`;
			code.insert( start, assignment );
			addedStuff = true;
		}

		if ( /Function/.test( this.parent.type ) ) {
			const params = this.parent.params;

			// default parameters
			if ( transforms.defaultParameter ) {
				params.filter( param => param.type === 'AssignmentPattern' ).forEach( param => {
					if ( addedStuff ) code.insert( start, `\n${indentation}` );

					const lhs = `if ( ${param.left.name} === void 0 ) ${param.left.name}`;
					code
						.insert( start, `${lhs}` )
						.move( param.left.end, param.right.end, start )
						.insert( start, `;` );

					addedStuff = true;
				});
			}

			// object pattern
			if ( transforms.parameterDestructuring ) {
				params.filter( param => param.type === 'ObjectPattern' ).forEach( param => {
					const ref = this.scope.createIdentifier( 'ref' );
					code.insert( param.start, ref );

					let lastIndex = param.start;

					param.properties.forEach( prop => {
						code.remove( lastIndex, prop.value.start );

						if ( addedStuff ) code.insert( start, `\n${indentation}` );

						const key = prop.key.name;

						if ( prop.value.type === 'Identifier' ) {
							code.remove( prop.value.start, prop.value.end );
							lastIndex = prop.value.end;

							const value = prop.value.name;
							code.insert( start, `var ${value} = ${ref}.${key};` );
						} else if ( prop.value.type === 'AssignmentPattern' ) {
							code.remove( prop.value.start, prop.value.right.start );
							lastIndex = prop.value.right.end;

							const value = prop.value.left.name;
							code
								.insert( start, `var ${ref}_${key} = ref.${key}, ${value} = ref_${key} === void 0 ? ` )
								.move( prop.value.right.start, prop.value.right.end, start )
								.insert( start, ` : ref_${key};` );
						}

						else {
							throw new CompileError( prop, `Compound destructuring is not supported` );
						}

						addedStuff = true;
						lastIndex = prop.end;
					});

					code.remove( lastIndex, param.end );
				});

				// array pattern. TODO dry this out
				params.filter( param => param.type === 'ArrayPattern' ).forEach( param => {
					const ref = this.scope.createIdentifier( 'ref' );
					code.insert( param.start, ref );

					let lastIndex = param.start;

					param.elements.forEach( ( element, i ) => {
						code.remove( lastIndex, element.start );

						if ( addedStuff ) code.insert( start, `\n${indentation}` );

						if ( element.type === 'Identifier' ) {
							code.remove( element.start, element.end );
							lastIndex = element.end;

							code.insert( start, `var ${element.name} = ${ref}[${i}];` );
						} else if ( element.type === 'AssignmentPattern' ) {
							code.remove( element.start, element.right.start );
							lastIndex = element.right.end;

							const name = element.left.name;
							code
								.insert( start, `var ${ref}_${i} = ref[${i}], ${name} = ref_${i} === void 0 ? ` )
								.move( element.right.start, element.right.end, start )
								.insert( start, ` : ref_${i};` );
						}

						else {
							throw new CompileError( element, `Compound destructuring is not supported` );
						}

						addedStuff = true;
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

					if ( addedStuff ) code.insert( start, `\n${indentation}` );

					const name = lastParam.argument.name;
					const len = this.scope.createIdentifier( 'len' );
					const count = params.length - 1;

					if ( count ) {
						code.insert( start, `var ${name} = [], ${len} = arguments.length - ${count};\n${indentation}while ( ${len}-- > 0 ) ${name}[ ${len} ] = arguments[ ${len} + ${count} ];` );
					} else {
						code.insert( start, `var ${name} = [], ${len} = arguments.length;\n${indentation}while ( ${len}-- ) ${name}[ ${len} ] = arguments[ ${len} ];` );
					}

					addedStuff = true;
				}
			}
		}

		if ( addedStuff ) {
			code.insert( start, `\n\n${indentation}` );
		}

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

							forStatement.aliases[ name ] = {
								outer: outerAlias,
								inner: innerAlias
							};

							declaration.instances.forEach( identifier => {
								const alias = forStatement.body.contains( identifier ) ?
									innerAlias :
									outerAlias;

								if ( name !== alias ) {
									code.overwrite( identifier.start, identifier.end, alias, true );
								}
							});

							cont = true;
						}
					}

					if ( !cont ) {
						const alias = this.scope.createIdentifier( name );

						if ( name !== alias ) {
							declaration.instances.forEach( identifier => {
								code.overwrite( identifier.start, identifier.end, alias, true );
							});
						}
					}
				}
			});
		}

		if ( this.synthetic && this.parent.type === 'ArrowFunctionExpression' ) {
			code.insert( this.body[0].start, 'return ' );
		}

		super.transpile( code, transforms );
	}
}
