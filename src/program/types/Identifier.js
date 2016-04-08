import Node from '../Node.js';
import isReference from '../../utils/isReference.js';

export default class Identifier extends Node {
	initialise () {
		if ( isReference( this, this.parent ) ) {
			if ( this.name === 'arguments' && !this.findScope().contains( this.name ) ) {
				const lexicalBoundary = this.findLexicalBoundary();
				const arrowFunction = this.findNearest( 'ArrowFunctionExpression' );

				if ( arrowFunction && arrowFunction.depth > lexicalBoundary.depth ) {
					const argumentsAlias = lexicalBoundary.getArgumentsAlias();
					if ( argumentsAlias ) this.alias = argumentsAlias;
				}
			}

			const declaration = this.findScope( false ).findDeclaration( this.name );
			if ( declaration ) {
				declaration.instances.push( this );
			} else {
				this.program.assumedGlobals[ this.name ] = true;
			}
		}
	}

	transpile () {
		if ( this.alias ) {
			this.program.magicString.overwrite( this.start, this.end, this.alias );
		}
	}
}
