import Node from '../Node.js';

export default class Super extends Node {
	initialise () {
		this.method = this.findNearest( 'MethodDefinition' );
		this.superClassName = this.findNearest( 'ClassBody' ).parent.superClass.name;

		if ( !this.method ) {
			throw new Error( 'super outside method' ); // TODO location etc
		}

		this.isCalled = this.parent.type === 'CallExpression';

		if ( this.method.kind === 'constructor' ) {
			if ( !this.isCalled ) throw new Error( 'super cannot be referred to in constructor outside a call expression' ); // TODO this is cryptic
		} else {
			if ( this.isCalled ) throw new Error( 'super() not allowed outside class constructor' );
		}

		this.isMember = this.parent.type === 'MemberExpression';

		if ( !this.isCalled && !this.isMember ) {
			throw new Error( 'Unexpected use of `super` (expected `super(...)` or `super.*`)' );
		}
	}

	transpile ( code ) {
		const expression = this.isCalled ? this.superClassName : `${this.superClassName}.prototype`;
		code.overwrite( this.start, this.end, expression, true );

		const callExpression = this.isCalled ? this.parent : this.parent.parent;

		if ( callExpression && callExpression.type === 'CallExpression' ) {
			code.insert( callExpression.callee.end, '.call' );

			if ( callExpression.arguments.length ) {
				code.insert( callExpression.arguments[0].start, `this, ` );
			} else {
				code.insert( callExpression.end - 1, `this` );
			}
		}
	}
}
