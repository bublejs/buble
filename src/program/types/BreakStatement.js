import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class BreakStatement extends Node {
	initialise () {
		this.loop = this.findNearest( /(?:For|While)Statement/ );
		this.loop.canBreak = true;
	}

	transpile ( code, transforms ) {
		if ( this.loop.shouldRewriteAsFunction ) {
			if ( this.label ) throw new CompileError( this, 'Labels are not currently supported in a loop with locally-scoped variables' );
			code.overwrite( this.start, this.start + 5, `return 'break'` );
		}
	}
}
