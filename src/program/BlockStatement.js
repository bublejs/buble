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
		if (functionScope && !this.isFunctionBlock)
			return this.parent.findScope(functionScope);
		return this.scope;
	}

	getArgumentsAlias() {
		if (!this.argumentsAlias) {
			this.argumentsAlias = this.scope.createIdentifier('arguments');
		}

		return this.argumentsAlias;
	}

	getArgumentsArrayAlias() {
		if (!this.argumentsArrayAlias) {
			this.argumentsArrayAlias = this.scope.createIdentifier('argsArray');
		}

		return this.argumentsArrayAlias;
	}

	getThisAlias() {
		if (!this.thisAlias) {
			this.thisAlias = this.scope.createIdentifier('this');
		}

		return this.thisAlias;
	}

	getIndentation() {
		if (this.indentation === undefined) {
			const source = this.program.magicString.original;

			const useOuter = this.synthetic || !this.body.length;
			let c = useOuter ? this.start : this.body[0].start;

			while (c && source[c] !== '\n') c -= 1;

			this.indentation = '';

			// eslint-disable-next-line no-constant-condition
			while (true) {
				c += 1;
				const char = source[c];

				if (char !== ' ' && char !== '\t') break;

				this.indentation += char;
			}

			const indentString = this.program.magicString.getIndentString();

			// account for dedented class constructors
			let parent = this.parent;
			while (parent) {
				parent = parent.parent;
			}

			if (useOuter) this.indentation += indentString;
		}

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
