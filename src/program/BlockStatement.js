import wrap from './wrap.js';
import Node from './Node.js';
import Scope from './Scope.js';

export default class BlockStatement extends Node {
	initialise () {
		this.thisAlias = null;
		this.argumentsAlias = null;
		this.defaultParameters = [];

		this.isFunctionBlock = this.parent.type === 'Root' || /Function/.test( this.parent.type );
		this.scope = new Scope({
			block: !this.isFunctionBlock,
			parent: this.parent.findScope( false ),
			params: null // TODO function params
		});

		const match = /\n(\s*)\S/.exec( this.program.magicString.slice( this.start ) );
		if ( match ) {
			this.indentation = match[1];
		}

		this.body.forEach( node => node.initialise() );
	}

	findLexicalBoundary () {
		if ( this.type === 'Program' ) return this;
		if ( /^Function/.test( this.parent.type ) ) return this;

		return this.parent.findLexicalBoundary();
	}

	findScope ( functionScope ) {
		if ( functionScope && !this.isFunctionBlock ) return this.parent.findScope( functionScope );
		return this.scope;
	}

	getArgumentsAlias () {
		if ( !this.argumentsAlias ) {
			this.argumentsAlias = this.scope.createIdentifier( 'arguments' );
		}

		return this.argumentsAlias;
	}

	getThisAlias () {
		if ( !this.thisAlias ) {
			this.thisAlias = this.scope.createIdentifier( 'this' );
		}

		return this.thisAlias;
	}

	transpile () {
		const magicString = this.program.magicString;
		const start = this.body[0] ? this.body[0].start : this.start + 1;

		let addedStuff = false;

		if ( this.argumentsAlias ) {
			const assignment = `var ${this.argumentsAlias} = arguments;`;
			magicString.insert( start, assignment );
			addedStuff = true;
		}

		if ( this.thisAlias ) {
			if ( addedStuff ) magicString.insert( start, `\n${this.indentation}` );
			const assignment = `var ${this.thisAlias} = this;`;
			magicString.insert( start, assignment );
			addedStuff = true;
		}

		if ( /Function/.test( this.parent.type ) ) {
			// default parameters
			this.parent.params.filter( param => param.type === 'AssignmentPattern' ).forEach( param => {
				if ( addedStuff ) magicString.insert( start, `\n${this.indentation}` );

				const lhs = `if ( ${param.left.name} === void 0 ) ${param.left.name}`;
				magicString
					.insert( start, `${lhs}` )
					.move( param.left.end, param.right.end, start )
					.insert( start, `;` );

				addedStuff = true;
			});

			// object pattern
			this.parent.params.filter( param => param.type === 'ObjectPattern' ).forEach( param => {
				const ref = this.scope.createIdentifier( 'ref' );
				magicString.insert( param.start, ref );

				let lastIndex = param.start;

				param.properties.forEach( prop => {
					magicString.remove( lastIndex, prop.value.start );

					if ( addedStuff ) magicString.insert( start, `\n${this.indentation}` );

					const key = prop.key.name;

					if ( prop.value.type === 'Identifier' ) {
						magicString.remove( prop.value.start, prop.value.end );
						lastIndex = prop.value.end;

						const value = prop.value.name;
						magicString.insert( start, `var ${value} = ${ref}.${key};` );
					} else if ( prop.value.type === 'AssignmentPattern' ) {
						magicString.remove( prop.value.start, prop.value.right.start );
						lastIndex = prop.value.right.end;

						const value = prop.value.left.name;
						magicString
							.insert( start, `var ${ref}_${key} = ref.${key}, ${value} = ref_${key} === void 0 ? ` )
							.move( prop.value.right.start, prop.value.right.end, start )
							.insert( start, ` : ref_${key};` );
					}

					else {
						throw new Error( `${prop.type} not currently supported` ); // TODO...
					}

					addedStuff = true;
					lastIndex = prop.end;
				});

				magicString.remove( lastIndex, param.end );
			});

			// array pattern. TODO dry this out
			this.parent.params.filter( param => param.type === 'ArrayPattern' ).forEach( param => {
				const ref = this.scope.createIdentifier( 'ref' );
				magicString.insert( param.start, ref );

				let lastIndex = param.start;

				param.elements.forEach( ( element, i ) => {
					magicString.remove( lastIndex, element.start );

					if ( addedStuff ) magicString.insert( start, `\n${this.indentation}` );

					if ( element.type === 'Identifier' ) {
						magicString.remove( element.start, element.end );
						lastIndex = element.end;

						magicString.insert( start, `var ${element.name} = ${ref}[${i}];` );
					} else if ( element.type === 'AssignmentPattern' ) {
						magicString.remove( element.start, element.right.start );
						lastIndex = element.right.end;

						const name = element.left.name;
						magicString
							.insert( start, `var ${ref}_${i} = ref[${i}], ${name} = ref_${i} === void 0 ? ` )
							.move( element.right.start, element.right.end, start )
							.insert( start, ` : ref_${i};` );
					}

					else {
						throw new Error( `${element.type} not currently supported` ); // TODO...
					}

					addedStuff = true;
					lastIndex = element.end;
				});

				magicString.remove( lastIndex, param.end );
			});
		}

		if ( addedStuff ) {
			magicString.insert( start, `\n\n${this.indentation}` );
		}

		if ( this.isFunctionBlock ) {
			Object.keys( this.scope.allDeclarations ).forEach( name => {
				const declarations = this.scope.allDeclarations[ name ];
				for ( let i = 1; i < declarations.length; i += 1 ) {
					const declaration = declarations[i];
					const alias = this.scope.createIdentifier( name );

					declaration.instances.forEach( identifier => {
						this.program.magicString.overwrite( identifier.start, identifier.end, alias );
					});
				}
			});
		}

		super.transpile();
	}
}
