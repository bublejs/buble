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
		const start = this.parent.type === 'Root' || this.synthetic ? this.start : this.start + 1;

		const indentation = this.synthetic ?
			this.getIndentation() + code.getIndentString() :
			( this.body.length ? this.body[0].getIndentation() : '' );

		let introStatementGenerators = [];

		if ( this.argumentsAlias ) {
			introStatementGenerators.push( ( start, prefix, suffix ) => {
				const assignment = `${prefix}var ${this.argumentsAlias} = arguments;${suffix}`;
				code.insertLeft( start, assignment );
			});
		}

		if ( this.thisAlias ) {
			introStatementGenerators.push( ( start, prefix, suffix ) => {
				const assignment = `${prefix}var ${this.thisAlias} = this;${suffix}`;
				code.insertLeft( start, assignment );
			});
		}

		if ( /Function/.test( this.parent.type ) ) {
			// object pattern
			if ( transforms.parameterDestructuring ) {
				this.transpileObjectPattern( code, introStatementGenerators );
				this.transpileArrayPattern( code, introStatementGenerators );
			}

			// default parameters
			if ( transforms.defaultParameter ) {
				this.transpileDefaultParameters( code, introStatementGenerators );
			}

			// rest parameter
			if ( transforms.spreadRest ) {
				this.transpileRestElement( code, introStatementGenerators, indentation );
			}
		}

		if ( transforms.letConst && this.isFunctionBlock ) {
			this.transpileBlockScopedIdentifiers( code );
		}

		super.transpile( code, transforms );

		if ( this.synthetic ) {
			if ( this.parent.type === 'ArrowFunctionExpression' ) {
				const expr = this.body[0];

				if ( introStatementGenerators.length ) {
					code.insertLeft( this.start, `{` ).insertRight( this.end, `${this.parent.getIndentation()}}` );

					code.insertRight( expr.start, `\n${indentation}return ` );
					code.insertLeft( expr.end, `;\n` );
				} else if ( transforms.arrow ) {
					code.insertRight( expr.start, `{ return ` );
					code.insertLeft( expr.end, `; }` );
				}
			}

			else if ( introStatementGenerators.length ) {
				code.insertLeft( this.start, `{` ).insertRight( this.end, `}` );
			}
		}

		let prefix = `\n${indentation}`;
		let suffix = '';
		introStatementGenerators.forEach( ( fn, i ) => {
			if ( i === introStatementGenerators.length - 1 ) suffix = ( this.parent.type === 'Root' ? `\n` : `\n` );
			fn( start, prefix, suffix );
		});
	}

	transpileBlockScopedIdentifiers ( code ) {
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

	transpileDefaultParameters ( code, introStatementGenerators ) {
		this.parent.params.filter( param => param.type === 'AssignmentPattern' ).forEach( param => {
			introStatementGenerators.push( ( start, prefix, suffix ) => {
				const lhs = `${prefix}if ( ${param.left.name} === void 0 ) ${param.left.name}`;
				code
					.insertRight( param.left.end, `${lhs}` )
					.move( param.left.end, param.right.end, start )
					.insertLeft( param.right.end, `;${suffix}` );
			});
		});
	}

	transpileObjectPattern ( code, introStatementGenerators ) {
		const params = this.parent.params;
		const objectPatterns = params.filter( param => param.type === 'ObjectPattern' );
		const assignmentPatterns = params.filter( param => param.type === 'AssignmentPattern' )
			.map( exp => exp.left ).filter( param => param.type === 'ObjectPattern' );
		[].concat(objectPatterns, assignmentPatterns).forEach( param => {
			const ref = this.scope.createIdentifier( 'ref' );
			param.name = ref;
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
						introStatementGenerators.push( ( start, prefix, suffix ) => {
							code.insertLeft( start, `${prefix}var ${value} = ${ref}.${key};${suffix}` );
						});
					}
				}

				else if ( prop.value.type === 'AssignmentPattern' ) {
					introStatementGenerators.push( ( start, prefix, suffix ) => {
						code.remove( prop.value.start, prop.value.right.start );

						const value = prop.value.left.name;

						code
							.insertRight( prop.value.right.start, `${prefix}var ${ref}_${key} = ${ref}.${key}, ${value} = ${ref}_${key} === void 0 ? ` )
							.insertLeft( prop.value.right.end, ` : ${ref}_${key};${suffix}` )
							.move( prop.value.right.start, prop.value.right.end, start );
					});
				}

				else {
					throw new CompileError( prop, `Compound destructuring is not supported` );
				}

				c = prop.value.end;
			});

			code.remove( c, param.end );
		});
	}

	transpileArrayPattern ( code, introStatementGenerators ) {
		// array pattern. TODO dry this out
		this.parent.params.filter( param => param.type === 'ArrayPattern' ).forEach( param => {
			const ref = this.scope.createIdentifier( 'ref' );
			code.insertRight( param.start, ref );

			let c = param.start;

			param.elements.forEach( ( element, i ) => {
				code.remove( c, element.start );

				if ( element.type === 'Identifier' ) {
					code.remove( element.start, element.end );

					introStatementGenerators.push( ( start, prefix, suffix ) => {
						code.insertLeft( start, `${prefix}var ${element.name} = ${ref}[${i}];${suffix}` );
					});
				} else if ( element.type === 'AssignmentPattern' ) {
					introStatementGenerators.push( ( start, prefix, suffix ) => {
						code.remove( element.start, element.right.start );

						const name = element.left.name;
						code
							.insertRight( element.right.start, `${prefix}var ${ref}_${i} = ref[${i}], ${name} = ref_${i} === void 0 ? ` )
							.insertLeft( element.right.end, ` : ref_${i};${suffix}` )
							.move( element.right.start, element.right.end, start );
					});
				}

				else {
					throw new CompileError( element, `Compound destructuring is not supported` );
				}

				c = element.end;
			});

			code.remove( c, param.end );
		});
	}

	transpileRestElement ( code, introStatementGenerators, indentation ) {
		const params = this.parent.params;

		const lastParam = params[ params.length - 1 ];
		if ( lastParam && lastParam.type === 'RestElement' ) {
			introStatementGenerators.push( ( start, prefix, suffix ) => {
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
				const len = this.scope.createIdentifier( 'len' );
				const count = params.length - 1;

				if ( count ) {
					code.insertLeft( start, `${prefix}var ${name} = [], ${len} = arguments.length - ${count};\n${indentation}while ( ${len}-- > 0 ) ${name}[ ${len} ] = arguments[ ${len} + ${count} ];${suffix}` );
				} else {
					code.insertLeft( start, `${prefix}var ${name} = [], ${len} = arguments.length;\n${indentation}while ( ${len}-- ) ${name}[ ${len} ] = arguments[ ${len} ];${suffix}` );
				}
			});
		}
	}
}
