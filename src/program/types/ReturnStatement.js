import Node from '../Node.js';

export default class ReturnStatement extends Node {
	initialise () {
		this.loop = this.findNearest( /(?:For|While)Statement/ );
		this.loop.canReturn = true;
	}

	transpile ( code ) {
		if ( this.loop.shouldRewriteAsFunction ) {
			code.insert( this.argument.start, `{ v: ` );
			code.insert( this.argument.end, ` }` );
		}
	}
}
