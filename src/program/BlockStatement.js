import wrap from './wrap.js';
import Node from './Node.js';
import Scope from './Scope.js';

export default class BlockStatement extends Node {
	initialise () {
		this.scope = new Scope();

		const match = /\n(\s*)\S/.exec( this.program.magicString.slice( this.start ) );
		if ( match ) {
			this.indentation = match[1];
		}

		this.body.forEach( node => node.initialise() );
	}

	findContextBoundary () {
		if ( this.type === 'Program' ) return this;
		if ( /^Function/.test( this.parent.type ) ) return this;
	}

	findScope () {
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

		super.transpile();
	}
}
