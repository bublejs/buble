import buble from 'rollup-plugin-buble';
import nodeResolve from 'rollup-plugin-node-resolve';

var external = process.env.DEPS ? null : [ 'acorn', 'magic-string' ];

export default {
	entry: 'src/index.js',
	moduleName: 'buble',
	plugins: [
		buble({
			include: [ 'src/**', 'node_modules/acorn/**' ]
		})
	],
	sourceMap: true
};
