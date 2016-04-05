//import Declaration from '../Declaration.js';
import extractNames from './extractNames.js';

const keyword = /\b(?:do|if|in|for|let|new|try|var|case|else|enum|eval|null|this|true|void|with|await|break|catch|class|const|false|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)\b/;

export default function Scope ( options ) {
	options = options || {};

	this.parent = options.parent;
	this.isBlockScope = !!options.block;

	let scope = this;
	while ( scope.isBlockScope ) scope = scope.parent;
	this.functionScope = scope;

	this.declarations = Object.create( null );
	this.allDeclarations = this.isBlockScope ? null : Object.create( null );
	this.aliases = this.isBlockScope ? null : Object.create( null );

	if ( options.params ) {
		options.params.forEach( node => {
			this.addDeclaration( node, 'param' );
		});
	}
}

Scope.prototype = {
	addDeclaration ( node, kind ) {
		extractNames( node ).forEach( name => {
			if ( this.declarations[ name ] ) {
				// TODO add location for debugging...
				throw new Error( `${name} is already declared` );
			}

			const declaration = { node, kind, instances: [] };
			this.declarations[ name ] = declaration;

			if ( !this.functionScope.allDeclarations[ name ] ) this.functionScope.allDeclarations[ name ] = [];
			this.functionScope.allDeclarations[ name ].push( declaration );
		});
	},

	contains ( name ) {
		return this.declarations[ name ] ||
		       ( this.parent ? this.parent.contains( name ) : false );
	},

	createIdentifier ( base ) {
		let name = base;
		let counter = 1;

		while ( this.allDeclarations[ name ] || this.aliases[ name ] || keyword.test( name ) ) {
			name = `${base}$${counter++}`;
		}

		this.aliases[ name ] = true;
		return name;
	},

	findDeclaration ( name ) {
		return this.declarations[ name ] ||
		       ( this.parent && this.parent.findDeclaration( name ) );
	}
};
