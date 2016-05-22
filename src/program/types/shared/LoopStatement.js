import Node from '../../Node.js';
import extractNames from '../../extractNames.js';

export default class LoopStatement extends Node {
	findScope ( functionScope ) {
		return functionScope || !this.createdScope ? this.parent.findScope( functionScope ) : this.body.scope;
	}

	initialise ( transforms ) {
		this.body.createScope();
		this.createdScope = true;

		// this is populated as and when reassignments occur
		this.reassigned = Object.create( null );
		this.aliases = Object.create( null );

		this.continueStatements = [];
		this.breakStatements = [];
		this.returnStatements = [];

		super.initialise( transforms );

		if ( transforms.letConst ) {
			// see if any block-scoped declarations are referenced
			// inside function expressions
			const names = Object.keys( this.body.scope.declarations );

			let i = names.length;
			while ( i-- ) {
				const name = names[i];
				const declaration = this.body.scope.declarations[ name ];

				let j = declaration.instances.length;
				while ( j-- ) {
					const instance = declaration.instances[j];
					const nearestFunctionExpression = instance.findNearest( /Function/ );

					if ( nearestFunctionExpression && nearestFunctionExpression.depth > this.depth ) {
						this.shouldRewriteAsFunction = true;
						break;
					}
				}

				if ( this.shouldRewriteAsFunction ) break;
			}
		}
	}

	transpile ( code, transforms ) {
		if ( this.shouldRewriteAsFunction ) {
			const i0 = this.getIndentation();
			const i1 = i0 + code.getIndentString();

			const argString = this.args ? ` ${this.args.join( ', ' )} ` : '';
			const paramString = this.params ? ` ${this.params.join( ', ' )} ` : '';

			const functionScope = this.findScope( true );
			const loop = functionScope.createIdentifier( 'loop' );

			const before = `var ${loop} = function (${paramString}) ` + ( this.body.synthetic ? `{\n${i0}${code.getIndentString()}` : '' );
			const after = ( this.body.synthetic ? `\n${i0}}` : '' ) + `;\n\n${i0}`;

			code.insertRight( this.body.start, before );
			code.insertLeft( this.body.end, after );
			code.move( this.start, this.body.start, this.body.end );

			if ( this.breakStatements.length || this.returnStatements.length ) {
				const returned = functionScope.createIdentifier( 'returned' );

				let insert = `{\n${i1}var ${returned} = ${loop}(${argString});\n`;
				if ( this.breakStatements.length ) insert += `\n${i1}if ( ${returned} === 'break' ) break;`;
				if ( this.returnStatements.length ) insert += `\n${i1}if ( ${returned} ) return returned.v;`;
				insert += `\n${i0}}`;

				code.insertRight( this.body.end, insert );
			} else {
				const callExpression = `${loop}(${argString});`;

				if ( this.type === 'DoWhileStatement' ) {
					code.overwrite( this.start, this.body.start, `do {\n${i1}${callExpression}\n${i0}}` );
				} else {
					code.insertRight( this.body.end, callExpression );
				}
			}

			this.breakStatements.forEach( statement => {
				code.overwrite( statement.start, statement.start + 5, `return 'break'` );
			});

			this.continueStatements.forEach( statement => {
				code.overwrite( statement.start, statement.start + 8, `return` );
			});

			this.returnStatements.forEach( statement => {
				if ( statement.argument ) {
					code.insertRight( statement.argument.start, `{ v: ` );
					code.insertLeft( statement.argument.end, ` }` );
				}
			});
		}

		super.transpile( code, transforms );
	}
}
