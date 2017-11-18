import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class FunctionDeclaration extends Node {
	initialise(transforms) {
		if (this.generator && transforms.generator) {
			throw new CompileError('Generators are not supported', this);
		}

		this.body.createScope();

		this.findScope(true).addDeclaration(this.id, 'function');
		super.initialise(transforms);
	}

	transpile(code, transforms) {
		super.transpile(code, transforms);
		if (transforms.trailingFunctionCommas && this.params.length) {
			let c = this.params[this.params.length - 1].end
			while (code.original[c] !== ')' && c < this.body.start) {
				if (code.original[c] === ',') {
					code.remove(c, c + 1);
					break;
				}
				++c;
			}
		}
	}
}
