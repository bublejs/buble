import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class ContinueStatement extends Node {
	initialise ( transforms ) {
		const loop = this.findNearest( /(?:For(?:In|Of)?|While)Statement/ );
		if ( loop ) loop.continueStatements.push( this );

		// if ( loop.shouldRewriteAsFunction ) {
		// 	if ( this.label ) throw new CompileError( this, 'Labels are not currently supported in a loop with locally-scoped variables' );
		// 	this.mark();
		// }
	}

	// transpile ( code, transforms ) {
	// 	code.overwrite( this.start, this.start + 8, 'return' );
	// }
}
