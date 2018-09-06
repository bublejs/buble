import createConfig from './rollup.create-config';
import pkg from './package.json';

const configs = [
	/* node ESM/CJS builds */
	createConfig({
		output: [
			{ format: 'es', file: pkg.module },
			{ format: 'cjs', file: pkg.main }
		],
	}),
	/* browser ESM/CJS builds (for bundlers) */
	createConfig({
		browser: true,
		output: [
			{ format: 'es', file: pkg.browser[pkg.module] },
			{ format: 'cjs', file: pkg.browser[pkg.main] }
		],
	}),
	/* UMD with bundled dependencies, ready for browsers */
	createConfig({
		browser: true,
		external: [],
		output: { format: 'umd', file: pkg.unpkg },
	}),
];

export default configs;
