import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class AssignmentExpression extends Node {
	initialise ( transforms ) {
		if ( this.left.type === 'Identifier' ) {
			const declaration = this.findScope( false ).findDeclaration( this.left.name );
			if ( declaration && declaration.kind === 'const' ) {
				throw new CompileError( this.left, `${this.left.name} is read-only` );
			}

			// special case – https://gitlab.com/Rich-Harris/buble/issues/11
			const statement = declaration && declaration.node.ancestor( 3 );
			if ( statement && statement.type === 'ForStatement' && statement.body.contains( this ) ) {
				statement.reassigned[ this.left.name ] = true;
			}
		}

		if ( /Pattern/.test( this.left.type ) ) {
			throw new CompileError( this.left, 'Destructuring assignments are not currently supported. Coming soon!' );
		}

		super.initialise( transforms );
	}

	transpile ( code, transforms ) {
		if ( this.operator === '**=' && transforms.exponentiation ) {
			const scope = this.findScope( false );
			const getAlias = name => {
				const declaration = scope.findDeclaration( name );
				return declaration ? declaration.name : name;
			};

			// `**=` -> `=`
			let charIndex = this.left.end;
			while ( code.original[ charIndex ] !== '*' ) charIndex += 1;
			code.remove( charIndex, charIndex + 2 );

			let base;

			let left = this.left;
			while ( left.type === 'ParenthesizedExpression' ) left = left.expression;

			if ( left.type === 'Identifier' ) {
				// const name = left.name;
				// const declaration = scope.findDeclaration( name );
				// base = declaration ? declaration.name : name;
				base = getAlias( left.name );
			} else if ( left.type === 'MemberExpression' ) {
				let object;
				let property;

				const statement = this.findNearest( /(?:Statement|Declaration)$/ );
				const i0 = statement.getIndentation();

				if ( left.property.type === 'Identifier' ) {
					property = left.computed ? getAlias( left.property.name ) : left.property.name;
				} else {
					property = scope.createIdentifier( 'property' );

					code.insert( statement.start, `var ${property} = ` );
					code.move( left.property.start, left.property.end, statement.start );
					code.insert( statement.start, `;\n${i0}` );

					code.overwrite( left.object.end, left.property.start, `[${property}]` );
					code.remove( left.property.end, left.end );
				}

				if ( left.object.type === 'Identifier' ) {
					object = getAlias( left.object.name );
				} else {
					object = scope.createIdentifier( 'object' );

					if ( statement.start === left.object.start ) {
						code.insert( statement.start, `var ${object} = ` );
						code.insert( left.object.end, `;\n${i0}${object}` );
					} else {
						code.insert( statement.start, `var ${object} = ` );
						code.move( left.object.start, left.object.end, statement.start );
						code.insert( statement.start, `;\n${i0}` );

						code.insert( left.object.end, object );
					}
				}

				base = object + ( left.computed ? `[${property}]` : `.${property}` );
			}

			code.insert( this.right.start, `Math.pow( ${base}, ` );
			code.insert( this.right.end, ` )` );
		}

		super.transpile( code, transforms );
	}
}
