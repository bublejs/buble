import buble from 'rollup-plugin-buble';
import json from 'rollup-plugin-json';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

var external = process.env.DEPS ? [] : [ 'acorn-jsx', 'magic-string' ];

export default {
	entry: 'src/index.js',
	moduleName: 'buble',
	plugins: [
		json(),
		commonjs(),
		buble({
			include: [ 'src/**', 'node_modules/acorn/**', 'node_modules/acorn-object-spread/**' ],
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
