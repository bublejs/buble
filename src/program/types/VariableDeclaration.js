import Node from '../Node.js';
import destructure from '../../utils/destructure.js';

function hasPatterns ( declarators ) {
	let i = declarators.length;
	while ( i-- ) {
		if ( declarators[i].id.type !== 'Identifier' ) return true;
	}
}

export default class VariableDeclaration extends Node {
	initialise ( transforms ) {
		this.scope = this.findScope( this.kind === 'var' );
		this.declarations.forEach( declarator => declarator.initialise( transforms ) );

		if ( transforms.letConst && this.kind !== 'var' ) {
			this.mark();
		} else if ( hasPatterns( this.declarations ) ) {
			this.mark();
		}
	}

	transpile ( code, transforms ) {
		let kind = this.kind;

		if ( transforms.letConst && kind !== 'var' ) {
			kind = 'var';
			code.overwrite( this.start, this.start + this.kind.length, kind, true );
		}

		if ( transforms.destructuring ) {
			let c = this.start;
			let lastDeclaratorIsPattern;

			this.declarations.forEach( ( declarator, i ) => {
				if ( declarator.id.type === 'Identifier' ) {
					if ( i > 0 && this.declarations[ i - 1 ].id.type !== 'Identifier' ) {
						code.overwrite( c, declarator.id.start, `var ` );
					}
				} else {
					const simple = declarator.init.type === 'Identifier' && !declarator.init.rewritten;
					const i0 = declarator.getIndentation();

					if ( i === 0 ) {
						code.remove( c, declarator.id.start );
					} else {
						code.overwrite( c, declarator.id.start, `;\n${i0}` );
					}

					const name = simple ? declarator.init.name : declarator.findScope( true ).createIdentifier( 'ref' );

					let c = declarator.start;

					let statementGenerators = [];

					if ( simple ) {
						code.remove( declarator.id.end, declarator.end );
					} else {
						statementGenerators.push( ( start, prefix, suffix ) => {
							code.insertRight( declarator.id.end, `var ${name}` );
							code.insertLeft( declarator.init.end, `;${suffix}` );
							code.move( declarator.id.end, declarator.end, start );
						});
					}

					destructure( code, declarator.findScope( true ), declarator.id, name, statementGenerators );

					let suffix = `\n${i0}`;
					statementGenerators.forEach( ( fn, j ) => {
						if ( i === this.declarations.length - 1 && j === statementGenerators.length - 1 ) {
							suffix = '';
						}

						fn( declarator.start, ``, suffix );
					});
				}

				if ( declarator.init && declarator.init.shouldTransform ) {
					declarator.init.transpile( code, transforms );
				}

				c = declarator.end;
				lastDeclaratorIsPattern = declarator.id.type !== 'Identifier';
			});

			if ( lastDeclaratorIsPattern ) {
				code.remove( c, this.end );
			}
		}

		else {
			this.declarations.forEach( declarator => {
				if ( declarator.init && declarator.init.shouldTransform ) {
					declarator.init.transpile( code, transforms );
				}
			});
		}

	}
}
