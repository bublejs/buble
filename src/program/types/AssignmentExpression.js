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
				let needsObjectVar = false;
				let property;
				let needsPropertyVar = false;
				let dotProperty = false;

				const statement = this.findNearest( /(?:Statement|Declaration)$/ );
				const i0 = statement.getIndentation();

				if ( left.property.type === 'Identifier' ) {
					property = left.computed ? getAlias( left.property.name ) : left.property.name;
					dotProperty = !left.computed;
				} else {
					property = scope.createIdentifier( 'property' );
					needsPropertyVar = true;
				}

				if ( left.object.type === 'Identifier' ) {
					object = getAlias( left.object.name );
				} else {
					object = scope.createIdentifier( 'object' );
					needsObjectVar = true;
				}

				if ( left.start === statement.start ) {
					// property
					if ( needsPropertyVar ) {
						code.insert( statement.start, `var ${property} = ` );
						code.move( left.property.start, left.property.end, statement.start );
						code.insert( statement.start, `;\n${i0}` );

						code.overwrite( left.object.end, left.property.start, `[${property}]` );
						code.remove( left.property.end, left.end );
					}

					// object
					if ( needsObjectVar ) {
						code.insert( statement.start, `var ${object} = ` );
						code.insert( left.object.end, `;\n${i0}${object}` );
					}
				}

				else {
					let declarators = [];
					if ( needsObjectVar ) declarators.push( object );
					if ( needsPropertyVar ) declarators.push( property );
					code.insert( statement.start, `var ${declarators.join( ', ' )};\n${i0}` );

					code.insert( left.start, `( ` );

					if ( needsObjectVar ) {
						code.insert( left.start, `${object} = ` );
						code.insert( left.object.end, `, ` );
					}

					if ( needsPropertyVar ) {
						code.insert( left.object.end, `${property} = ` );
						code.move( left.property.start, left.property.end, left.object.end );
						// code.insert( left.end, `, ` );
					}

					code.remove( left.object.end, left.property.start );
					code.overwrite( left.property.end, left.end, `, ${object}${ dotProperty ? `.${property}` : `[${property}]` }` );

					code.insert( this.end, ` )` );
				}

				base = object + ( left.computed ? `[${property}]` : `.${property}` );
			}

			code.insert( this.right.start, `Math.pow( ${base}, ` );
			code.insert( this.right.end, ` )` );
		}

		super.transpile( code, transforms );
	}
}
