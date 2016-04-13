import Node from '../Node.js';

export default class ReturnStatement extends Node {
	initialise () {
		this.loop = this.findNearest( /(?:For|While)Statement/ );
		this.nearestFunction = this.findNearest( /Function/ );

		if ( this.loop && ( !this.nearestFunction || this.loop.depth > this.nearestFunction.depth ) ) {
			this.loop.canReturn = true;
			this.shouldWrap = true;
		}

		this.argument.initialise();
	}

	transpile ( code ) {
		const shouldWrap = this.shouldWrap && this.loop && this.loop.shouldRewriteAsFunction;
		if ( shouldWrap ) code.insert( this.argument.start, `{ v: ` );

		this.argument.transpile( code );

		if ( shouldWrap ) code.insert( this.argument.end, ` }` );
	}
}
