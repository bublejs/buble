import Node from '../Node.js';

export default class ThisExpression extends Node {
	initialise () {
		const contextBoundary = this.findContextBoundary();
		const arrowFunction = this.findNearest( /ArrowFunctionExpression/ );

		if ( arrowFunction && arrowFunction.depth > contextBoundary.depth ) {
			const thisAlias = contextBoundary.getThisAlias();
			if ( thisAlias ) this.alias = thisAlias;
		}
	}

	transpile () {
		if ( this.alias ) {
			this.program.magicString.overwrite( this.start, this.end, this.alias );
		}
	}
}
