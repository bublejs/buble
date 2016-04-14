import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class ForOfStatement extends Node {
	initialise ( transforms ) {
		throw new CompileError( this, 'for...of statements are not supported' );
	}
}
