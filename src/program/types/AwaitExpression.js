import Node from '../Node.js';

const noop = () => {};

export default class AwaitExpression extends Node {
	static removeAsync(code, transforms, async, start, callback = noop) {
		if (transforms.asyncAwait && async) {
			code.remove(start, start + 6);
			callback();
		}
	}

	transpile (code, transforms) {
		AwaitExpression.removeAsync(code, transforms, true, this.start, () => {
			code.insertLeft(this.argument.start, 'return ');
		});

		super.transpile(code, transforms);
	}
}
