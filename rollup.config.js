import buble from 'rollup-plugin-buble';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

const config = {
	input: 'src/index.js',
	plugins: [
		json(),
		commonjs(),
		buble({
			target: {
				node: 4
			},
			include: [
				'src/**',
				'node_modules/acorn-object-spread/**',
				'node_modules/unicode-loose-match/**',
				'node_modules/regexpu-core/**'
			],
			transforms: {
				dangerousForOf: true
			}
		}),
		resolve()
	]
};

const globals = {
  'acorn/dist/acorn.js': 'acorn',
  'magic-string': 'MagicString'
};

export default [
	/* ESM/UMD builds */
	Object.assign({}, config, {
		external: ['acorn/dist/acorn.js', 'magic-string'],
		output: [
			{ format: 'es', file: pkg.module, globals, sourcemap: true, name: 'buble' },
			{ format: 'umd', file: pkg.main, globals, sourcemap: true, name: 'buble' }
		]
	}),

	/* UMD with bundled dependencies, for browsers */
	Object.assign({}, config, {
		output: [
			{ format: 'umd', file: pkg.browser, sourcemap: true, name: 'buble' }
		]
	})
];
