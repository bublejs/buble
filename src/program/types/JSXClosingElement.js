import Node from '../Node.js';

export default class JSXClosingElement extends Node {
	transpile ( code, transforms ) {
		code.remove( this.start, this.end );
	}
}
