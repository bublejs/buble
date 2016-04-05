import wrap from './wrap.js';
import Node from './Node.js';
import Scope from './Scope.js';

export default class BlockStatement extends Node {
	initialise () {
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
		let insert = '';

		if ( this.argumentsAlias ) {
			const assignment = `var ${this.argumentsAlias} = arguments;`;
			insert += this.indentation ? `${assignment}\n${this.indentation}` : ` ${assignment} `;
		}

		if ( this.thisAlias ) {
			const assignment = `var ${this.thisAlias} = this;`;
			insert += this.indentation ? `${assignment}\n${this.indentation}` : ` ${assignment} `;
		}

		if ( insert ) this.program.magicString.insert( this.body[0] ? this.body[0].start : this.start + 1, insert );

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
