import buble from 'rollup-plugin-buble';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

const ensureArray = maybeArr => Array.isArray(maybeArr) ? maybeArr : [maybeArr];

const createConfig = (opts) => {
	opts = opts || {};
	const browser = opts.browser || false;
	const external = opts.external || Object.keys(pkg.dependencies || {});
	const output = ensureArray(opts.output);

	return {
		input: 'src/index.js',
		output: output.map(format => Object.assign({}, format, {
			name: 'buble',
			sourcemap: true
		})),
		external: external,
		plugins: [
			json(),
			commonjs({ extensions: ['.js', '.mjs'] }),
			buble({
				target: !browser ? { node: 4 } : null,
				include: [
					'src/**',
					// For unpkg build
					'node_modules/acorn-jsx/**',
					'node_modules/regexpu-core/**',
					'node_modules/unicode-match-property-ecmascript/**',
					'node_modules/unicode-match-property-value-ecmascript/**',
				],
				transforms: {
					dangerousForOf: true
				}
			}),
			resolve()
		],
	};
};

export default createConfig;
