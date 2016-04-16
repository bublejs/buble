module.exports = [
	{
		description: 'transpiles shorthand properties',
		input: `obj = { x, y }`,
		output: `obj = { x: x, y: y }`
	},

	{
		description: 'transpiles shorthand methods',

		input: `
			obj = {
				foo () { return 42; }
			}`,

		output: `
			obj = {
				foo: function foo () { return 42; }
			}`
	},

	{
		description: 'does not transpile computed properties',
		input: `
			obj = {
				[x]: 'x'
			}`,

		error: /Computed properties are not supported/
	}
];
