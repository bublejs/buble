import Node from '../Node.js';

export default class Identifier extends Node {
	initialise () {
		if ( this.name === 'arguments' && !this.findScope().contains( this.name ) ) {
			const contextBoundary = this.findContextBoundary();
			const arrowFunction = this.findNearest( /ArrowFunctionExpression/ );

			if ( arrowFunction && arrowFunction.depth > contextBoundary.depth ) {
				const argumentsAlias = contextBoundary.getArgumentsAlias();
				if ( argumentsAlias ) this.alias = argumentsAlias;
			}
		}
	}

	transpile () {
		if ( this.alias ) {
			this.program.magicString.overwrite( this.start, this.end, this.alias );
		}
	}
}
