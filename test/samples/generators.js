module.exports = [
	{
		description: 'disallows generator function declarations',

		input: `
			function* foo () {

			}`,

		error: /Generators are not supported/
	},

	{
		description: 'disallows generator function expressions',

		input: `
			var fn = function* foo () {

			}`,

		error: /Generators are not supported/
	},

	{
		description: 'disallows generator functions as object literal methods',

		input: `
			var obj = {
				*foo () {

				}
			};`,

		error: /Generators are not supported/
	},

	{
		description: 'disallows generator functions as class methods',

		input: `
			class Foo {
				*foo () {

				}
			}`,

		error: /Generators are not supported/
	},

	{
		description:
			'ignores generator function declarations with `transforms.generator: false`',
		options: { transforms: { generator: false } },
		input: `function* foo () {}`,
		output: `function* foo () {}`
	},

	{
		description:
			'ignores generator function expressions with `transforms.generator: false`',
		options: { transforms: { generator: false } },
		input: `var foo = function* foo () {}`,
		output: `var foo = function* foo () {}`
	},

	{
		description:
			'ignores generator function methods with `transforms.generator: false`',
		options: { transforms: { generator: false } },
		input: `var obj = { *foo () {} }`,
		output: `var obj = { foo: function* foo () {} }`
	},

	{
		description:
			'ignores generator function class methods with `transforms.generator: false`',
		options: { transforms: { generator: false } },
		input: `
			class Foo {
				*foo () {
					// code goes here
				}
			}`,

		output: `
			var Foo = function Foo () {};

			Foo.prototype.foo = function* foo () {
				// code goes here
			};`
	}
];
