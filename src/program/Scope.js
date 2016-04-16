import extractNames from './extractNames.js';
import reserved from '../utils/reserved.js';
import CompileError from '../utils/CompileError.js';

const letConst = /^(?:let|const)$/;

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
			const existingDeclaration = this.declarations[ name ];
			if ( existingDeclaration && letConst.test( kind ) && letConst.test( existingDeclaration.kind ) ) {
				// TODO warn about double var declarations?
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
