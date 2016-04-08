import wrap from './wrap.js';
import Node from './Node.js';
import Scope from './Scope.js';

export default class BlockStatement extends Node {
	initialise () {
		this.thisAlias = null;
		this.argumentsAlias = null;
		this.defaultParameters = [];

		this.isFunctionBlock = this.parent.type === 'Root' || /Function/.test( this.parent.type );
		this.scope = new Scope({
			block: !this.isFunctionBlock,
			parent: this.parent.findScope( false ),
			params: null // TODO function params
		});

		const match = /\n(\s*)\S/.exec( this.program.magicString.slice( this.start ) );
		if ( match ) {
			this.indentation = match[1];
		}

		this.body.forEach( node => node.initialise() );
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

	transpile () {
		const magicString = this.program.magicString;
		const start = this.body[0] ? this.body[0].start : this.start + 1;

		let addedStuff = false;

		if ( this.argumentsAlias ) {
			const assignment = `var ${this.argumentsAlias} = arguments;`;
			magicString.insert( start, assignment );
			addedStuff = true;
		}

		if ( this.thisAlias ) {
			if ( addedStuff ) magicString.insert( start, `\n${this.indentation}` );
			const assignment = `var ${this.thisAlias} = this;`;
			magicString.insert( start, assignment );
			addedStuff = true;
		}

		if ( this.defaultParameters ) {
			this.defaultParameters.forEach( param => {
				if ( addedStuff ) magicString.insert( start, `\n${this.indentation}` );

				const lhs = `if ( ${param.left.name} === void 0 ) ${param.left.name}`;
				magicString.insert( start, `${lhs}` );
				magicString.move( param.left.end, param.right.end, start );
				magicString.insert( start, `;` );

				addedStuff = true;
			});
		}

		if ( addedStuff ) {
			magicString.insert( start, `\n\n${this.indentation}` );
		}

		if ( this.isFunctionBlock ) {
			Object.keys( this.scope.allDeclarations ).forEach( name => {
				const declarations = this.scope.allDeclarations[ name ];
				for ( let i = 1; i < declarations.length; i += 1 ) {
					const declaration = declarations[i];
					const alias = this.scope.createIdentifier( name );

					declaration.instances.forEach( identifier => {
						this.program.magicString.overwrite( identifier.start, identifier.end, alias );
					});
				}
			});
		}

		super.transpile();
	}
}
