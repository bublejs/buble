import Node from '../Node.js';

export default class FunctionExpression extends Node {
	transpile () {
		this.body.defaultParameters = this.params.filter( param => param.type === 'AssignmentPattern' );
		super.transpile();
	}
}
