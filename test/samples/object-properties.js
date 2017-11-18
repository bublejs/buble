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
		description:
			'transpiles shorthand methods with numeric or string names (#139)',

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
				0: function () {},
				5: function () {},
				80: function () {},
				.12e3: function () {},
				491: function () {},
				12e34: function () {},
				0xFFFF: function () {},
				"a string": function astring() {},
				"var": function var$1() {},
			}`
	},

	{
		description:
			'shorthand properties can be disabled with `transforms.conciseMethodProperty === false`',
		options: { transforms: { conciseMethodProperty: false } },
		input: `var obj = { x, y, z () {} }`,
		output: `var obj = { x, y, z () {} }`
	},

	{
		description:
			'computed properties can be disabled with `transforms.computedProperty === false`',
		options: { transforms: { computedProperty: false } },
		input: `var obj = { [x]: 'x' }`,
		output: `var obj = { [x]: 'x' }`
	},

	{
		description: 'transpiles computed properties without spacing (#117)',

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
	},

	{
		description: 'avoids shadowing free variables with method names (#166)',

		input: `
			let x = {
				foo() { return foo },
				bar() {}
			}
		`,
		output: `
			var x = {
				foo: function foo$1() { return foo },
				bar: function bar() {}
			}
		`
	}
];
