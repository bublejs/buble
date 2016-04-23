import MagicString from 'magic-string';
import BlockStatement from './BlockStatement.js';

export default function Program ( source, ast, transforms ) {
	this.type = 'Root';

	this.source = source;
	this.magicString = new MagicString( source );

	this.ast = ast;
	this.depth = 0;

	this.body = new BlockStatement( ast, this );

	this.templateElements = [];
	this.body.initialise( transforms );

	this.indentExclusions = {};
	for ( const node of this.templateElements ) {
		for ( let i = node.start; i < node.end; i += 1 ) {
			this.indentExclusions[ node.start + i ] = true;
		}
	}

	this.body.transpile( this.magicString, transforms );
}

Program.prototype = {
	export ( options = {} ) {
		return {
			code: this.magicString.toString(),
			map: this.magicString.generateMap({
				file: options.file,
				source: options.source,
				includeContent: options.includeContent !== false
			})
		};
	},

	findNearest () {
		return null;
	},

	findScope () {
		return null;
	}
};
