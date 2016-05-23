import buble from 'rollup-plugin-buble';
import json from 'rollup-plugin-json';
import nodeResolve from 'rollup-plugin-node-resolve';
import { resolve } from 'path';

var external = process.env.DEPS ? [ 'acorn-jsx' ] : [ 'acorn-jsx', 'magic-string' ];

export default {
	entry: 'src/index.js',
	moduleName: 'buble',
	plugins: [
		// {
		// 	resolveId: function ( id ) {
		// 		// for the browser build, we want to bundle Acorn, but not
		// 		// from the dist file
		// 		if ( process.env.DEPS && id === 'acorn' ) {
		// 			return resolve( __dirname, 'node_modules/acorn/src/index.js' );
		// 		}
		// 	}
		// },
		json(),
		buble({
			include: [ 'src/**', 'node_modules/acorn/**' ],
			transforms: {
				dangerousForOf: true
			}
		}),
		nodeResolve({
			jsnext: true,
			skip: external
		})
	],
	external: external,
	globals: {
		'acorn-jsx': 'acorn',
		'magic-string': 'MagicString'
	},
	sourceMap: true
};
