import Node from '../Node.js';

export default class ThisExpression extends Node {
	initialise () {
		const lexicalBoundary = this.findLexicalBoundary();
		const arrowFunction = this.findNearest( 'ArrowFunctionExpression' );
		const loop = this.findNearest( /(?:For|While)Statement/ );

		if ( arrowFunction && arrowFunction.depth > lexicalBoundary.depth ) {
			this.alias = lexicalBoundary.getThisAlias();
		}

		if ( loop && loop.depth > lexicalBoundary.depth ) {
			this.alias = lexicalBoundary.getThisAlias();
		}
	}

	transpile ( code ) {
		if ( this.alias ) {
			code.overwrite( this.start, this.end, this.alias, true );
		}
	}
}
