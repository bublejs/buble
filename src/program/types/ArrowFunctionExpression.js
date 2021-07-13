import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class ArrowFunctionExpression extends Node {
	initialise(transforms) {
		this.body.createScope();
		super.initialise(transforms);
	}

	transpile(code, transforms) {
		let openParensPos = this.start;
		for (let end = (this.body || this.params[0]).start - 1; code.original[openParensPos] !== '(' && openParensPos < end;) {
			++openParensPos;
		}
		if (code.original[openParensPos] !== '(') openParensPos = -1;
		const naked = openParensPos === -1;

    super.transpile(code, transforms);
	}

	// Returns whether any transforms that will happen use `arguments`
	needsArguments(transforms) {
		return false;
	}
}
