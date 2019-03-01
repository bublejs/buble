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
		error: /Transforming async functions is not implemented/
	},

	{
		description: 'passes through async arrow functions if transform is disabled',
		options: { transforms: { asyncAwait: false } },
		input: `(async () => {})`,
		output: `(async function () {})`
	},

	{
		description: 'errors on async arrow functions if transform is enabled',
		input: `(async () => {})`,
		error: /Transforming async arrow functions is not implemented/
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
		error: /Transforming async functions is not implemented/
	},

	{
		skip: true, // https://github.com/Rich-Harris/buble/issues/146
		description: 'passes through async short-hand methods if transform is disabled',
		options: { transforms: { asyncAwait: false } },
		input: `({ async x() {} })`,
		output: `({ x: async function x() {} })`
	},

	{
		description: 'errors on async short-hand methods if transform is enabled',
		input: `({ async x() {} })`,
		error: /Transforming async functions is not implemented/
	},

	{
		skip: true, // https://github.com/Rich-Harris/buble/issues/146
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
		error: /Transforming async functions is not implemented/
	},

	{
		description: 'passes through async arrow function properties if transform is disabled',
		options: { transforms: { asyncAwait: false } },
		input: `({ x: async () => {} })`,
		output: `({ x: async function () {} })`
	},

	{
		description: 'errors on async arrow function properties if transform is enabled',
		input: `({ x: async () => {} })`,
		error: /Transforming async arrow functions is not implemented/
	},

	{
		description: 'passes through async arrow function with naked parameter if transform is disabled',
		options: { transforms: { asyncAwait: false } },
		input: `async a => {}`,
		output: `!async function(a) {}`
	},

	{
		description: 'errors on async arrow function with naked parameter if transform is enabled',
		input: `async a => {}`,
		error: /Transforming async arrow functions is not implemented/
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
	}
];
