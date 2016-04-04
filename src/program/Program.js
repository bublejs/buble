import MagicString from 'magic-string';
import BlockStatement from './BlockStatement.js';

export default function Program ( source, ast ) {
	this.source = source;
	this.magicString = new MagicString( source );

	this.ast = ast;
	this.depth = 0;

	this.body = new BlockStatement( ast, this );

	this.body.initialise();
	this.body.transpile();
}

Program.prototype = {
	export () {
		return {
			code: this.magicString.toString(),
			map: this.magicString.generateMap()
		};
	},

	findNearest () {
		return null;
	}
};
