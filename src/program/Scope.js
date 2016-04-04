//import Declaration from '../Declaration.js';
import extractNames from './extractNames.js';

export default function Scope ( options ) {
	options = options || {};

	this.parent = options.parent;
	this.isBlockScope = !!options.block;
	//this.isTopLevel = !this.parent || ( this.parent.isTopLevel && this.isBlockScope );

	this.declarations = Object.create( null );

	if ( options.params ) {
		options.params.forEach( param => {
			extractNames( param ).forEach( name => {
				this.declarations[ name ] = param;
			});
		});
	}
}

Scope.prototype = {
	addDeclaration ( node, isBlockDeclaration ) {
		if ( !isBlockDeclaration && this.isBlockScope ) {
			// it's a `var` or function node, and this
			// is a block scope, so we need to go up
			this.parent.addDeclaration( node, isBlockDeclaration );
		} else {
			extractNames( node.raw.id ).forEach( name => {
				this.declarations[ name ] = node;
			});
		}
	},

	contains ( name ) {
		return this.declarations[ name ] ||
		       ( this.parent ? this.parent.contains( name ) : false );
	},

	createIdentifier ( base ) {
		return base + '$1';
	},

	// eachDeclaration ( fn ) {
	// 	Object.keys( this.declarations ).forEach( key => {
	// 		fn( key, this.declarations[ key ] );
	// 	});
	// },

	findDeclaration ( name ) {
		return this.declarations[ name ] ||
		       ( this.parent && this.parent.findDeclaration( name ) );
	}
};
