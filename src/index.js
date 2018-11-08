import { Parser } from 'acorn';
import acornJsx from 'acorn-jsx';
import acornDynamicImport from 'acorn-dynamic-import';
import Program from './program/Program.js';
import { features, matrix } from './support.js';
import getSnippet from './utils/getSnippet.js';

const parser = Parser.extend(acornDynamicImport, acornJsx());

const dangerousTransforms = ['dangerousTaggedTemplateString', 'dangerousForOf'];

const fallbackOrThrow = (fallback, environment, version) => {
	const error = `Unknown environment/version '${environment}/${version}'. Please raise an issue at https://github.com/Rich-Harris/buble/issues`
	if (!('bitmask' in fallback)) throw new Error(error)
	if (!fallback.suppress) console.error(error)
	return fallback.bitmask
}

const nearest = (versions, version, fallback, environment) => {
	const nearestVersion = Object.keys(versions).sort().reverse().find(v => v <= version)
	return nearestVersion
		? versions[nearestVersion]
		: fallbackOrThrow(fallback, environment, version)
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
		? 0b11111111111111111111111
		: 0b00010000000000000000001;

	Object.keys(target).forEach(environment => {
		const versions = matrix[environment]
				, version  = target[environment]
				, support  = !versions           ? fallbackOrThrow(fallback, environment, version)
									 : version in versions ? versions[version]
																				 : nearest(versions, version, fallback, environment)

		bitmask &= support;
	});

	const transforms = Object.create(null);
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
		ast = parser.parse(source, {
			ecmaVersion: 10,
			preserveParens: true,
			sourceType: 'module',
			allowReturnOutsideFunction: true,
			onComment: (block, text) => {
				if (!jsx) {
					const match = /@jsx\s+([^\s]+)/.exec(text);
					if (match) jsx = match[1];
				}
			}
		});
		options.jsx = jsx || options.jsx;
	} catch (err) {
		err.snippet = getSnippet(source, err.loc);
		err.toString = () => `${err.name}: ${err.message}\n${err.snippet}`;
		throw err;
	}

	const transforms = target(options.target || {});
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
	if (options.objectAssign === true) options.objectAssign = 'Object.assign';
	return new Program(source, ast, transforms, options).export(options);
}

export { version as VERSION } from '../package.json';
