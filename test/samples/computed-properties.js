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
			var obj = {
				b: 2
			};
			obj[a] = 1;`
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
				a: 1,
				c: 3
			};
			obj[b] = 2;`
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
			var obj = {
				b: 2,
				e: 5
			};
			obj[a] = 1;
			obj[c] = 3;
			obj[d] = 4;
			obj[f] = 6;`
	},

	{
		description: 'creates computed property in complex expression',

		input: `
			var a = 'foo', obj = { [a]: 'bar', x: 42 }, bar = obj.foo;`,

		output: `
			var obj$1;
			var a = 'foo', obj = ( obj$1 = { x: 42 }, obj$1[a] = 'bar', obj$1 ), bar = obj.foo;`
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
		description: 'creates a computed method with a non-identifier expression (#78)',

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
	}
];
