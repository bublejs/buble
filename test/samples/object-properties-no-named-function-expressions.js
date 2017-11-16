module.exports = [
	{
		description: 'transpiles shorthand properties',
		options: { namedFunctionExpressions: false },
		input: `obj = { x, y }`,
		output: `obj = { x: x, y: y }`
	},

	{
		description: 'transpiles shorthand methods',
		options: { namedFunctionExpressions: false },

		input: `
			obj = {
				foo () { return 42; }
			}`,

		output: `
			obj = {
				foo: function () { return 42; }
			}`
	},

	{
		description: 'transpiles shorthand methods with quoted names (#82)',
		options: { namedFunctionExpressions: false },

		input: `
			obj = {
				'foo-bar' () { return 42; }
			}`,

		output: `
			obj = {
				'foo-bar': function () { return 42; }
			}`
	},

	{
		description: 'transpiles shorthand methods with reserved names (!68)',
		options: { namedFunctionExpressions: false },

		input: `
			obj = {
				catch () { return 42; }
			}`,

		output: `
			obj = {
				catch: function () { return 42; }
			}`
	},

	{
		description:
			'transpiles shorthand methods with numeric or string names (#139)',
		options: { namedFunctionExpressions: false },

		input: `
			obj = {
				0() {},
				0b101() {},
				80() {},
				.12e3() {},
				0o753() {},
				12e34() {},
				0xFFFF() {},
				"a string"() {},
				"var"() {},
			}`,

		output: `
			obj = {
				0: function() {},
				5: function() {},
				80: function() {},
				.12e3: function() {},
				491: function() {},
				12e34: function() {},
				0xFFFF: function() {},
				"a string": function() {},
				"var": function() {},
			}`
	},

	{
		description:
			'shorthand properties can be disabled with `transforms.conciseMethodProperty === false`',
		options: {
			namedFunctionExpressions: false,
			transforms: { conciseMethodProperty: false }
		},
		input: `var obj = { x, y, z () {} }`,
		output: `var obj = { x, y, z () {} }`
	},

	{
		description:
			'computed properties can be disabled with `transforms.computedProperty === false`',
		options: {
			namedFunctionExpressions: false,
			transforms: { computedProperty: false }
		},
		input: `var obj = { [x]: 'x' }`,
		output: `var obj = { [x]: 'x' }`
	},

	{
		description: 'transpiles computed properties without spacing (#117)',
		options: { namedFunctionExpressions: false },

		input: `
			if (1)
				console.log(JSON.stringify({['com'+'puted']:1,['foo']:2}));
			else
				console.log(JSON.stringify({['bar']:3}));
		`,
		output: `
			var obj, obj$1;

			if (1)
				{ console.log(JSON.stringify(( obj = {}, obj['com'+'puted'] = 1, obj['foo'] = 2, obj ))); }
			else
				{ console.log(JSON.stringify(( obj$1 = {}, obj$1['bar'] = 3, obj$1 ))); }
		`
	}
];
