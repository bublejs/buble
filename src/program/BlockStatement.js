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
		this.initialStatements = [];

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
			this.insertStatement([ `var ${this.argumentsAlias} = arguments;` ]);
		}

		return this.argumentsAlias;
	}

	getThisAlias () {
		if ( !this.thisAlias ) {
			this.thisAlias = this.scope.createIdentifier( 'this' );
			this.insertStatement([ `var ${this.thisAlias} = this;` ]);
		}

		return this.thisAlias;
	}

	insertStatement ( components ) {
		this.initialStatements.push( components );
	}

	transpile ( code, transforms ) {
		const start = this.body[0] ? this.body[0].start : this.start + 1;

		const indentation = this.synthetic ?
			this.getIndentation() + code.getIndentString() :
			( this.body.length ? this.body[0].getIndentation() : '' );

		let addedStuff = false;

		for ( let statement of this.initialStatements ) {
			if ( addedStuff ) code.insert( start, `\n${indentation}` );

			for ( let component of statement ) {
				if ( typeof component === 'string' ) {
					code.insert( start, component );
				} else {
					code.move( component[0], component[1], start );
				}
			}

			addedStuff = true;
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
								code.overwrite( identifier.start, identifier.end, alias, true );
							}
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
