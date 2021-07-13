import Node from './Node.js';
import Scope from './Scope.js';
import destructure from '../utils/destructure.js';

function isUseStrict(node) {
	if (!node) return false;
	if (node.type !== 'ExpressionStatement') return false;
	if (node.expression.type !== 'Literal') return false;
	return node.expression.value === 'use strict';
}

export default class BlockStatement extends Node {
	createScope() {
		this.parentIsFunction = /Function/.test(this.parent.type);
		this.isFunctionBlock = this.parentIsFunction || this.parent.type === 'Root';
		this.scope = new Scope({
			block: !this.isFunctionBlock,
			parent: this.parent.findScope(false),
			declare: id => this.createdDeclarations.push(id)
		});

		if (this.parentIsFunction) {
			this.parent.params.forEach(node => {
				this.scope.addDeclaration(node, 'param');
			});
		}
	}

	initialise(transforms) {
		this.thisAlias = null;
		this.argumentsAlias = null;
		this.defaultParameters = [];
		this.createdDeclarations = [];

		// normally the scope gets created here, during initialisation,
		// but in some cases (e.g. `for` statements), we need to create
		// the scope early, as it pertains to both the init block and
		// the body of the statement
		if (!this.scope) this.createScope();

		this.body.forEach(node => node.initialise(transforms));

		this.scope.consolidate();
	}

	findLexicalBoundary() {
		if (this.type === 'Program') return this;
		if (/^Function/.test(this.parent.type)) return this;

		return this.parent.findLexicalBoundary();
	}

	findScope(functionScope) {
		return this.scope;
	}

	getIndentation() {
		return this.indentation;
	}

	transpile(code, transforms) {
		const indentation = this.getIndentation();

		const introStatementGenerators = [];

		if (/Function/.test(this.parent.type)) {
			this.transpileParameters(
				this.parent.params,
				code,
				transforms,
				indentation,
				introStatementGenerators
			);
		}

		super.transpile(code, transforms);
	}
	transpileParameters() { }
}
