"use strict";
/**
Run buble on test262 and execute the result

S1: Wrong behavior of transpiled code
S2: Transpiled code throws an error at runtime
S3: Transpiling throws an unexpected error
S4: this is a known, documented issue
skip: These tests don't say anything interesting
pass: transpiled code behaves correctly
*/

// FIXME: Check that expectations match at least one file

const fs = require("fs");
const path = require("path");
const vm = require('vm');

const TestStream = require('test262-stream');
const parse = require("acorn").parse;

const data = require('./test262-data.js');
const features_list = data.features_list;
const file_list = data.file_list;
const transform = require("..").transform;

const verbose = process.argv[2] == "-v";
const nodeVersion = Number(process.version.match(/^v(\d+)\./)[1]);

const acornWhitelist = fs.readFileSync(__dirname + "/test262-acorn.whitelist", "utf8").split("\n").filter(i => i.match(/ \(strict mode\)$/)).map(i => i.substr(0, i.length-(" (strict mode)".length)));

const endOfAssertJs = "message += 'Expected a ' + expectedErrorConstructor.name + ' to be thrown but no exception was thrown at all';\n  $ERROR(message);\n};";

const useStrict = '"use strict";\n';

process.on("unhandledRejection", (e) => {
	e && console.warn(e);
});

const exec = (harness, text, filename, async) => {
	return new Promise((resolve, reject) => {
		try {
			vm.runInNewContext(`${useStrict}
					var $262 = {
						destroy() {},
						createRealm() { return { global: global }; }
					};
					${harness}
					${async ? "$DONE = _SANDBOX_DONE" : ""}
					${text}`,
			{ global, _SANDBOX_DONE: e => e ? reject(e) : resolve() },
			{timeout: 1000, filename}
			);
			if (!async) resolve();
		} catch (e) {
			reject(e);
		}
	});
};

const runTest = (content, harness, report, filename, async) => {
	// If it is valid ES3 code, we don't need to transpile.
	// import.meta and dynamic import() is valid ES3, though.
	if (verbose) process.stdout.write("es3 ... ");
	if (!content.match(/import/)) {
		try {
			parse(content, {ecmaVersion: 3});
			return Promise.resolve({skip: "validEs3"});
		} catch (e) {}
	}

	if (verbose) process.stdout.write("transpile ... ");
	// Transpile
	let transformed;
	try {
		transformed = transform(content, { transforms: { dangerousForOf: true, dangerousTaggedTemplateString: true }, objectAssign: "Object.assign" }).code;
	} catch (e) {
		if (e.message.match(/is not implemented./)) return report(4, e);
		return report(3, e);
	}

	if (verbose) process.stdout.write("es5 ... ");
	// Make sure transpiled code is valid ES5
	try { parse(transformed, {ecmaVersion: 5}); } catch (e) { return report(2, e); }

	return exec(harness, transformed, filename, async).then(
		() => ({pass: "true"}),
		e => report(1, e)
	);
};

let failed = false;
const fail = (test, msg) => {
	console.warn(`${test.file}${test.attrs.features ? (' (' + test.attrs.features.join(', ') + ')') : ''}: ${msg}`);
	failed = true;
};
const report = (test, expectedS) => (s, e, details) => {
	if (!expectedS) fail(test, `Unexpected S${s}: ${e}`);
	return Promise.resolve({fail: `s${s}${details ? "_" + details : ""}`});
};
const handle = test => {
	////////////////////////////
	// Check skip and prepare //
	////////////////////////////
	const skip = m => Promise.resolve(`skip_${m}`);
	if (test.attrs.negative && (test.attrs.negative.phase === "parse" || test.attrs.negative.phase === "early")) {
		return skip("testsParseError");
	}
	if (test.attrs.negative && test.attrs.negative.phase === "runtime") {
		// FIXME: This should be doable
		return skip("testsRuntimeError");
	}

	test.file = test.file.substr(5); // Strip leading 'test/'

	for (const item of data.skip_list)
		if (test.file.match(item.pattern)) return skip(item.desc);

	if ([
		"built-ins/Date/parse/time-value-maximum-range.js",
	].indexOf(test.file) > -1) {
		return skip("testsRunTimeBehaviourOnly");
	}

	if (acornWhitelist.indexOf(test) > -1) {
		return skip("acornWhitelist");
	}

	if ([
		"built-ins/TypedArrayConstructors/ctors/typedarray-arg/other-ctor-buffer-ctor-species-not-ctor-throws.js",
		"language/global-code/decl-lex.js",
		"language/module-code/instn-local-bndng-const.js"
	].indexOf(test.file) > -1 ||
			test.file.endsWith("put-const.js") ||
			test.file.indexOf("const-invalid-assignment") > -1) {
		// test bug: buble performs runtime const check at compile time
		return skip("constCheck");
	}

	let harness = '';
	if (!test.attrs.flags.raw) {
		if (test.contents.substr(0, useStrict.length) !== useStrict) {
			return skip("noStrict");
		}
		const m = test.contents.indexOf(endOfAssertJs) + endOfAssertJs.length;
		harness = test.contents.substr(0, m);
		test.contents = test.contents.substr(m);
	}
	if (test.contents.match(/(eval(Script)?[()])|(Function\(")/)) {
		return skip("eval");
	}

	////////////////////////
	// Check expectations //
	////////////////////////
	let expected = {s: 0};
	const expect = (s, tag) => {
		if (s > expected.s) {
			expected = {s, tag};
		}
	};

	if ((nodeVersion === 4 && test.file === "built-ins/TypedArrayConstructors/of/this-is-not-constructor.js")) {
		expect(1, "node4Bug");
	}
	if (test.file === "language/statements/class/subclass/builtin-objects/Proxy/no-prototype-throws.js" && nodeVersion === 6) {
		return skip("node6Bug");
	}

	// FIXME: S4 tests could also disable that specific transform
	if (test.attrs.features)
		for (const feature of test.attrs.features)
			if (features_list[feature])
				expect.apply(null, features_list[feature]);

	for (const item of file_list)
		if (test.file.match(item.pattern)) expect(item.level, item.desc);

	// regExpUtils.js contains destructured arguments
	if ((test.attrs.includes || []).indexOf("regExpUtils.js") > -1) {
		harness = transform(harness, { transforms: { dangerousForOf: true } }).code;
	}

	//////////////
	// Run test //
	//////////////
	return runTest(test.contents, harness, report(test, expected.s), test.file, test.attrs.flags.async).then(result => {
		if (expected.s) {
			const expectedString = `s${expected.s}_${expected.tag}`;
			if (result.skip === "nodeBug" && expected.s > 1) {
				fail(test, `Could not verify ${expectedString} due to skip_${result.skip}`);
			} else if (!result.skip) {
				if (!result.fail || result.fail !== "s" + expected.s && !((expected.s == 3 || expected.s == 4) && (result.fail == "s3" || result.fail == "s4"))) {
					fail(test, `Expected ${expectedString}, but got ${JSON.stringify(result)}`);
				} else {
					result.fail = expectedString;
				}
			}
		}
		return result.skip ? "skip_" + result.skip : (result.pass ? "pass_" + result.pass : "fail_" + result.fail);
	});
};

const testDir = path.dirname(require.resolve("test262/package.json"));
const stream = new TestStream(testDir);
const counts = {};
let last = Promise.resolve();
stream.on('data', test => last = last.then(() => {
	if (verbose) process.stdout.write(`${test.file}${test.attrs.features ? ' (' + test.attrs.features.join(', ') + ')' : ''} ... `);
	return handle(test).then(result => {
		if (verbose) process.stdout.write(`${result}\n`);
		counts[result] = (counts[result] || 0) + 1;
	});
}));
stream.on('end', () => {
	const sorted_counts = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || (b < a ? 1 : -1)).map(k => [k, counts[k]]);
	sorted_counts.forEach(v => console.log(v[0] + ": " + v[1]));
	process.exit(failed ? 1 : 0);
});
