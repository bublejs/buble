module.exports = [
	{
		description: 'supports async as property name',

		input: `
			({async, foo})`,

		output: `
			({async: async, foo: foo})`
	},

	{
		description: 'passes through async function declarations if transform is disabled',
		options: { transforms: { asyncAwait: false } },
		input: `async function A() {}`,
		output: `async function A() {}`
	},

	{
		description: 'errors on async function declarations if transform is enabled',
		input: `async function A() {}`,
		output: `function A() { return Promise.resolve(); }`
	},

	{
		skip: true, // https://github.com/Rich-Harris/buble/issues/109
		description: 'passes through async arrow functions if transform is disabled',
		options: { transforms: { asyncAwait: false } },
		input: `(async () => {})`,
		output: `(async function() {})`
	},

	{
		description: 'errors on async arrow functions if transform is enabled',
		input: `(async () => {})`,
		output: `(function() { return Promise.resolve(); })`
	},

	{
		description: 'passes through async function expressions if transform is disabled',
		options: { transforms: { asyncAwait: false } },
		input: `const A = async function () {}`,
		output: `var A = async function () {}`
	},

	{
		description: 'errors on async function expressions if transform is enabled',
		input: `const A = async function () {}`,
		output: `var A = function A() { return Promise.resolve(); })`
	},

	{
		skip: true, // https://github.com/Rich-Harris/buble/issues/109
		description: 'passes through async short-hand methods if transform is disabled',
		options: { transforms: { asyncAwait: false } },
		input: `({ async x() {} })`,
		output: `({ x: async function x() {} })`
	},

	{
		description: 'errors on async short-hand methods if transform is enabled',
		input: `({ async x() {} })`,
		output: `({ x: function x() { return Promise.resolve(); }})`
	},

	{
		skip: true, // https://github.com/Rich-Harris/buble/issues/109
		description: 'passes through async class methods if transform is disabled',
		options: { transforms: { asyncAwait: false } },
		input: `
			(class { async x() {} })`,

		output: `
			(/*@__PURE__*/(function () {
				function anonymous () {}

				anonymous.prototype.x = async function x () {};

				return anonymous;
			}()))`
	},

	{
		description: 'errors on async class methods if transform is enabled',
		input: `(class { async x() {} })`,
		error: /Transforming async functions is not implemented/
	},

	{
		description: 'passes through async function properties if transform is disabled',
		options: { transforms: { asyncAwait: false } },
		input: `({ x: async function() {} })`,
		output: `({ x: async function() {} })`
	},

	{
		description: 'errors on async function properties if transform is enabled',
		input: `({ x: async function() {} })`,
		output: `({ x: function() { return Promise.resolve(); }})`
	},

	{
		skip: true, // https://github.com/Rich-Harris/buble/issues/109
		description: 'passes through async arrow function properties if transform is disabled',
		options: { transforms: { asyncAwait: false } },
		input: `({ x: async () => {} })`,
		output: `({ x: async function() {} })`
	},

	{
		description: 'errors on async arrow function properties if transform is enabled',
		input: `({ x: async () => {} })`,
		output: `({ x: function x() { return Promise.resolve(); }})`
	},

	{
		description: 'passes through top-level await if transform is disabled',
		options: { transforms: { asyncAwait: false } },
		input: `const x = await someFunction();`,
		output: `var x = await someFunction();`
	},

	{
		description: 'errors on top-level await if transform is enabled',
		input: `const x = await someFunction();`,
		error: /Transforming await is not implemented/
	},

	{
		description: 'passes through top-level for-await-of if transform is disabled',
		options: { transforms: { asyncAwait: false, forOf: false } },
		input: `for await (const x of someFunction()) { x() }`,
		output: `for await (var x of someFunction()) { x() }`
	},

	{
		description: 'errors on top-level for-await-of if transform is enabled',
		options: { transforms: { asyncAwait: true, dangerousForOf: true } },
		input: `for await (const x of someFunction()) { x() }`,
		error: /Transforming for-await-of statements is not implemented/
	},

	// variables interaction with async :
	{
		description: 'transpiles a variable decleration with await',
		options: { transforms: { asyncAwait: true } },
		input: `async function f() { const a = await f1(); return a + 1; }`,
		output: `function f() { return Promise.resolve().then(function(){ return f1(); }).then(function(a){ return a + 1;})`
	},

	{
		description: 'transpiles multiple variable declerations in a row',
		options: { transforms: { asyncAwait: true } },
		input: `async function f() { const a1 = await f1(); const a2 = await f2(); return a1 + a2; }`,
		output: `function f() { const a1; const a2; return Promise.resolve().then(function(){ return f1(); }).then(function(ref){ a1 = ref; return f2(); }).then(function(ref) { a2 = ref; return a1 + a2; }); }`
	},

	{
		description: 'should not allow changes to constant variables',
		options: { transforms: { asyncAwait: true } },
		input: `async function f() { const x = await f1(); x = await f2(); }`,
		error: /x is read-only/
	},

	{
		description: 'transpiles a object destructure of await result',
		options: { transforms: { asyncAwait: true } },
		input: `async function f() { const { a1, a2 } = await f1(); return a1 + a2; }`,
		output: `function f() { var a1; var a2; return Promise.resolve().then(function(){ return f1(); }).then(function(ref){ a1 = ref.a1; a2 = ref.a2; return a1 + a2; });}`
	},

	{
		description: 'transpiles an array destructure of await result',
		options: { transforms: { asyncAwait: true } },
		input: `async function f() { const [ a1, a2 ] = await f1(); return a1 + a2; }`,
		output: `function f() { var a1; var a2; return Promise.resolve().then(function(){ return f1(); }).then(function(ref){ a1 = ref[0]; a2 = ref[1]; return a1 + a2; });}`
	}
	// END variables interaction with async
];
