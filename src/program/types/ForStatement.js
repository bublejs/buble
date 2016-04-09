import Node from '../Node.js';
import extractNames from '../extractNames.js';

export default class ForStatement extends Node {
	findScope ( functionScope ) {
		return functionScope || !this.createdScope ? this.parent.findScope( functionScope ) : this.body.scope;
	}

	initialise () {
		this.body.createScope();
		this.createdScope = true;

		super.initialise();
	}

	transpile () {
		// see if any block-scoped declarations are referenced
		// inside function expressions
		const names = Object.keys( this.body.scope.declarations );
		let shouldRewriteAsFunction = false;

		let i = names.length;
		while ( i-- ) {
			const name = names[i];
			const declaration = this.body.scope.declarations[ name ];

			let j = declaration.instances.length;
			while ( j-- ) {
				const instance = declaration.instances[j];
				const nearestFunctionExpression = instance.findNearest( /Function/ );

				if ( nearestFunctionExpression && nearestFunctionExpression.depth > this.depth ) {
					shouldRewriteAsFunction = true;
					break;
				}
			}

			if ( shouldRewriteAsFunction ) break;
		}

		if ( shouldRewriteAsFunction ) {
			const magicString = this.program.magicString;

			const indentation = this.getIndentation();

			// which variables are declared in the init statement?
			const names = this.init.type === 'VariableDeclaration' ?
				[].concat.apply( [], this.init.declarations.map( declarator => extractNames( declarator.id ) ) ) :
				[];

			const before = `var forLoop = function ( ${names.join( ', ' )} ) ` + ( this.body.synthetic ? `{\n${indentation}${magicString.getIndentString()}` : '' );
			const after = ( this.body.synthetic ? `\n${indentation}}` : '' ) + `;\n\n${indentation}`;

			magicString.insert( this.start, before );
			magicString.move( this.body.start, this.body.end, this.start );
			magicString.insert( this.start, after );

			magicString.insert( this.end, `forLoop( ${names.join( ', ' )} );` );
		}

		super.transpile();
	}
}
