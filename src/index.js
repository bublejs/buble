import * as acorn from 'acorn';
import acornJsx from 'acorn-jsx/inject';
import acornObjectSpread from 'acorn5-object-spread/inject';
import Program from './program/Program.js';
import { features, matrix } from './support.js';
import getSnippet from './utils/getSnippet.js';

const { parse } = [acornObjectSpread, acornJsx].reduce(
	(final, plugin) => plugin(final),
	acorn
);

const dangerousTransforms = ['dangerousTaggedTemplateString', 'dangerousForOf'];

const fallbackOrThrow = (fallback, error) => {
	if (!('bitmask' in fallback)) throw new Error(error)
	if (!fallback.suppress) console.error(error)
	return fallback.bitmask
}

export function target(target) {
	const fallback = {} 
	if ('fallback' in target) {
		fallback.environment = Object.keys(target.fallback).filter(d => d != 'suppress').pop()
		fallback.version = target.fallback[fallback.environment]
		fallback.suppress = !!target.fallback.suppress
		delete target.fallback
		if (matrix[fallback.environment] && (fallback.version in matrix[fallback.environment]))
			fallback.bitmask = matrix[fallback.environment][fallback.version]
	}

	const targets = Object.keys(target);
	let bitmask = targets.length
		? 0b11111111111111111111111111111111
		: 0b01000000000000000000000000000000;

	Object.keys(target).forEach(environment => {
		const versions = matrix[environment]
		const support = 
			!versions                          ? fallbackOrThrow(fallback, `Unknown environment '${environment}'. Please raise an issue at https://github.com/Rich-Harris/buble/issues`)
		: !(target[environment] in versions) ? fallbackOrThrow(fallback, `Support data exists for the following versions of ${environment}: ${Object.keys(versions).join(', ')}. Please raise an issue at https://github.com/Rich-Harris/buble/issues`)
																				 : versions[target[environment]]

		bitmask &= support;
	});

	let transforms = Object.create(null);
	features.forEach((name, i) => {
		transforms[name] = !(bitmask & (1 << i));
	});

	dangerousTransforms.forEach(name => {
		transforms[name] = false;
	});

	return transforms;
}

export function transform(source, options = {}) {
	let ast;
	let jsx = null;

	try {
		ast = parse(source, {
			ecmaVersion: 8,
			preserveParens: true,
			sourceType: 'module',
			onComment: (block, text) => {
				if (!jsx) {
					let match = /@jsx\s+([^\s]+)/.exec(text);
					if (match) jsx = match[1];
				}
			},
			plugins: {
				jsx: true,
				objectSpread: true
			}
		});
		options.jsx = jsx || options.jsx;
	} catch (err) {
		err.snippet = getSnippet(source, err.loc);
		err.toString = () => `${err.name}: ${err.message}\n${err.snippet}`;
		throw err;
	}

	let transforms = target(options.target || {});
	Object.keys(options.transforms || {}).forEach(name => {
		if (name === 'modules') {
			if (!('moduleImport' in options.transforms))
				transforms.moduleImport = options.transforms.modules;
			if (!('moduleExport' in options.transforms))
				transforms.moduleExport = options.transforms.modules;
			return;
		}

		if (!(name in transforms)) throw new Error(`Unknown transform '${name}'`);
		transforms[name] = options.transforms[name];
	});

	return new Program(source, ast, transforms, options).export(options);
}

export { version as VERSION } from '../package.json';
