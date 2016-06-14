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
			var a = 'foo', obj = { [a]: 'bar' }, bar = obj.foo;`,

		output: `
			var obj$1;
			var a = 'foo', obj = ( obj$1 = {}, obj$1[a] = 'bar', obj$1 ), bar = obj.foo;`
	}
];
