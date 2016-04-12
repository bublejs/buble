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
	}
];
