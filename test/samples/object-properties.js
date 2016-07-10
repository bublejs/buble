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
		description: 'transpiles shorthand methods with quoted names (#82)',

		input: `
			obj = {
				'foo-bar' () { return 42; }
			}`,

		output: `
			obj = {
				'foo-bar': function foo_bar () { return 42; }
			}`
	},

	{
		description: 'transpiles shorthand methods with reserved names (!68)',

		input: `
			obj = {
				catch () { return 42; }
			}`,

		output: `
			obj = {
				catch: function catch$1 () { return 42; }
			}`
	},

	{
		description: 'shorthand properties can be disabled with `transforms.conciseMethodProperty === false`',
		options: { transforms: { conciseMethodProperty: false } },
		input: `var obj = { x, y, z () {} }`,
		output: `var obj = { x, y, z () {} }`
	},

	{
		description: 'computed properties can be disabled with `transforms.computedProperty === false`',
		options: { transforms: { computedProperty: false } },
		input: `var obj = { [x]: 'x' }`,
		output: `var obj = { [x]: 'x' }`
	}
];
