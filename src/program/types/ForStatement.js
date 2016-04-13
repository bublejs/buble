import Node from '../Node.js';
import extractNames from '../extractNames.js';

export default class ForStatement extends Node {
	findScope ( functionScope ) {
		return functionScope || !this.createdScope ? this.parent.findScope( functionScope ) : this.body.scope;
	}

	initialise () {
		this.body.createScope();
		this.createdScope = true;

		// this is populated as and when reassignments occur
		this.reassigned = Object.create( null );
		this.aliases = Object.create( null );

		super.initialise();

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

	transpile ( code ) {
		if ( this.shouldRewriteAsFunction ) {
			const i0 = this.getIndentation();
			const i1 = i0 + code.getIndentString();

			// which variables are declared in the init statement?
			const names = this.init.type === 'VariableDeclaration' ?
				[].concat.apply( [], this.init.declarations.map( declarator => extractNames( declarator.id ) ) ) :
				[];

			const aliases = this.aliases;

			const args = names.map( name => name in this.aliases ? this.aliases[ name ].outer : name );
			const params = names.map( name => name in this.aliases ? this.aliases[ name ].inner : name );

			const updates = Object.keys( this.reassigned )
				.map( name => `${aliases[ name ].outer} = ${aliases[ name ].inner};` );

			if ( updates.length ) {
				if ( this.body.synthetic ) {
					code.insert( this.body.body[0].end, `; ${updates.join(` `)}` );
				} else {
					const lastStatement = this.body.body[ this.body.body.length - 1 ];
					code.insert( lastStatement.end, `\n\n${i1}${updates.join(`\n${i1}`)}` );
				}
			}

			const functionScope = this.findScope( true );
			const loop = functionScope.createIdentifier( 'loop' );

			const before = `var ${loop} = function ( ${params.join( ', ' )} ) ` + ( this.body.synthetic ? `{\n${i0}${code.getIndentString()}` : '' );
			const after = ( this.body.synthetic ? `\n${i0}}` : '' ) + `;\n\n${i0}`;

			code.insert( this.start, before );
			code.move( this.body.start, this.body.end, this.start );
			code.insert( this.start, after );

			if ( this.canBreak || this.canReturn ) {
				const returned = functionScope.createIdentifier( 'returned' );

				let insert = `{\n${i1}var ${returned} = ${loop}( ${args.join( ', ' )} );\n`;
				if ( this.canBreak ) insert += `\n${i1}if ( ${returned} === 'break' ) break;`;
				if ( this.canReturn ) insert += `\n${i1}if ( ${returned} ) return returned.v;`;
				insert += `\n${i0}}`;

				code.insert( this.end, insert );
			} else {
				code.insert( this.end, `${loop}( ${args.join( ', ' )} );` );
			}
		}

		super.transpile( code );
	}
}
