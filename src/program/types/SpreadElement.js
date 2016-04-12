import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class SpreadElement extends Node {
	initialise () {
		throw new CompileError( this, 'The spread operator is not currently supported' );
	}
}
