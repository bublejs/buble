import extractNames from './extractNames.js';
import CompileError from '../utils/CompileError.js';

let reserved = Object.create( null );
'do if in for let new try var case else enum eval null this true void with await break catch class const false super throw while yield delete export import public return static switch typeof default extends finally package private continue debugger function arguments interface protected implements instanceof'.split( ' ' )
	.forEach( word => reserved[ word ] = true );

export default function Scope ( options ) {
	options = options || {};

	this.parent = options.parent;
	this.isBlockScope = !!options.block;

	let scope = this;
	while ( scope.isBlockScope ) scope = scope.parent;
	this.functionScope = scope;

	this.declarations = Object.create( null );
	this.references = Object.create( null );
	this.blockScopedDeclarations = this.isBlockScope ? null : Object.create( null );
	this.aliases = this.isBlockScope ? null : Object.create( null );
}

Scope.prototype = {
	addDeclaration ( node, kind ) {
		extractNames( node ).forEach( name => {
			if ( this.declarations[ name ] ) {
				throw new CompileError( node, `${name} is already declared` );
			}

			const declaration = { node, kind, instances: [] };
			this.declarations[ name ] = declaration;

			if ( this.isBlockScope ) {
				if ( !this.functionScope.blockScopedDeclarations[ name ] ) this.functionScope.blockScopedDeclarations[ name ] = [];
				this.functionScope.blockScopedDeclarations[ name ].push( declaration );
			}
		});
	},

	addReference ( identifier ) {
		const declaration = this.declarations[ identifier.name ];
		if ( declaration ) {
			declaration.instances.push( identifier );
		} else {
			this.references[ identifier.name ] = true;
			if ( this.parent ) this.parent.addReference( identifier );
		}
	},

	contains ( name ) {
		return this.declarations[ name ] ||
		       ( this.parent ? this.parent.contains( name ) : false );
	},

	createIdentifier ( base ) {
		let name = base;
		let counter = 1;

		while ( this.declarations[ name ] || this.references[ name ] || this.aliases[ name ] || name in reserved ) {
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
