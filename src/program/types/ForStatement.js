import Node from '../Node.js';
import extractNames from '../extractNames.js';

export default class ForStatement extends Node {
	findScope ( functionScope ) {
		return functionScope || !this.initialisedBody ? this.parent.findScope( functionScope ) : this.body.scope;
	}

	initialise () {
		this.body.initialise();
		this.initialisedBody = true;

		this.init.initialise();
		this.test.initialise();
		this.update.initialise();
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
				const nearestFunctionExpression = instance.findNearest( 'FunctionExpression' );

				if ( nearestFunctionExpression && nearestFunctionExpression.depth > this.depth ) {
					shouldRewriteAsFunction = true;
					break;
				}
			}

			if ( shouldRewriteAsFunction ) break;
		}

		if ( shouldRewriteAsFunction ) {
			const magicString = this.program.magicString;

			const match = /[ \t]+$/.exec( magicString.original.slice( 0, this.start ) );
			const indentation = match ? match[0] : '';

			// which variables are declared in the init statement?
			const names = this.init.type === 'VariableDeclaration' ?
				[].concat.apply( [], this.init.declarations.map( declarator => extractNames( declarator.id ) ) ) :
				[];

			magicString.insert( this.start, `var forLoop = function ( ${names.join( ', ' )} ) ` );
			magicString.move( this.body.start, this.body.end, this.start );
			magicString.insert( this.start, `;\n\n${indentation}` );

			magicString.insert( this.end, `forLoop( ${names.join( ', ' )} );` );
		}

		super.transpile();
	}
}
