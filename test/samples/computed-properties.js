module.exports = [
	{
		description: 'creates a computed property',

		input: `
			var obj = {
				[a]: 1
			};`,

		output: `
			var obj = {};
			obj[a] = 1;`
	},

	{
		description: 'creates a computed property with a non-identifier expression',

		input: `
			var obj = {
				[a()]: 1
			};`,

		output: `
			var obj = {};
			obj[a()] = 1;`
	},

	{
		description: 'creates a computed property at start of literal',

		input: `
			var obj = {
				[a]: 1,
				b: 2
			};`,

		output: `
			var obj = {};
			obj[a] = 1;
			obj.b = 2;`
	},

	{
		description: 'creates a computed property at end of literal',

		input: `
			var obj = {
				a: 1,
				[b]: 2
			};`,

		output: `
			var obj = {
				a: 1
			};
			obj[b] = 2;`
	},

	{
		description: 'creates a computed property in middle of literal',

		input: `
			var obj = {
				a: 1,
				[b]: 2,
				c: 3
			};`,

		output: `
			var obj = {
				a: 1
			};
			obj[b] = 2;
			obj.c = 3;`
	},

	{
		description: 'creates multiple computed properties',

		input: `
			var obj = {
				[a]: 1,
				b: 2,
				[c]: 3,
				[d]: 4,
				e: 5,
				[f]: 6
			};`,

		output: `
			var obj = {};
			obj[a] = 1;
			obj.b = 2;
			obj[c] = 3;
			obj[d] = 4;
			obj.e = 5;
			obj[f] = 6;`
	},

	{
		description: 'creates computed property in complex expression',

		input: `
			var a = 'foo', obj = { [a]: 'bar', x: 42 }, bar = obj.foo;`,

		output: `
			var obj$1;

			var a = 'foo', obj = ( obj$1 = {}, obj$1[a] = 'bar', obj$1.x = 42, obj$1 ), bar = obj.foo;`
	},

	{
		description: 'creates computed property in block with conflicts',

		input: `
			var x;

			if ( true ) {
				let x = {
					[a]: 1
				};
			}`,

		output: `
			var x;

			if ( true ) {
				var x$1 = {};
				x$1[a] = 1;
			}`
	},

	{
		description: 'closing parenthesis put in correct place (#73)',

		input: `
			call({ [a]: 5 });`,

		output: `
			var obj;

			call(( obj = {}, obj[a] = 5, obj ));`
	},

	{
		description: 'creates a computed method (#78)',

		input: `
			var obj = {
				[a] () {
					// code goes here
				}
			};`,

		output: `
			var obj = {};
			obj[a] = function () {
					// code goes here
				};`
	},

	{
		description:
			'creates a computed method with a non-identifier expression (#78)',

		input: `
			var obj = {
				[a()] () {
						// code goes here
					}
			};`,

		output: `
			var obj = {};
			obj[a()] = function () {
						// code goes here
					};`
	},

	{
		description:
			'does not require space before parens of computed method (#82)',

		input: `
			var obj = {
				[a]() {
					// code goes here
				}
			};`,

		output: `
			var obj = {};
			obj[a] = function () {
					// code goes here
				};`
	},

	{
		description:
			'supports computed shorthand function with object spread in body (#135)',

		options: {
			objectAssign: 'Object.assign'
		},
		input: `
			let a = {
				[foo] (x, y) {
					return {
						...{abc: '123'}
					};
				},
			};
		`,
		output: `
			var a = {};
			a[foo] = function (x, y) {
					return Object.assign({}, {abc: '123'});
				};
		`
	},

	{
		description:
			'object literal with computed property within arrow expression (#126)',

		input: `
			foo => bar({[x - y]: obj});
		`,
		output: `
			var obj$1;

			!function(foo) { return bar(( obj$1 = {}, obj$1[x - y] = obj, obj$1 )); };
		`
	},

	{
		description: 'Supports nested computed properties (#51)',

		input: `
			(function () { return { [key]: { [key]: val } } })
		`,
		output: `
			(function () {
			var obj, obj$1;
 return ( obj$1 = {}, obj$1[key] = ( obj = {}, obj[key] = val, obj ), obj$1 ) })
		`
	}
];
