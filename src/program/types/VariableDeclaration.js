import Node from '../Node.js';
import destructure from '../../utils/destructure.js';
import { loopStatement } from '../../utils/patterns.js';

export default class VariableDeclaration extends Node {
	initialise(transforms) {
		this.scope = this.findScope(this.kind === 'var');
		this.declarations.forEach(declarator => declarator.initialise(transforms));
	}

	transpile(code, transforms) {
		const i0 = this.getIndentation();
		let kind = this.kind;

    this.declarations.forEach(declarator => {
      declarator.transpile(code, transforms);
    });
	}
}
