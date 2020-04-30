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
		description: 'creates a computed property at start of literal with method afterwards',

		input: `
			var obj = {
				[a]: 1,
				b() {}
			};`,

		output: `
			var obj = {};
			obj[a] = 1;
			obj.b = function b() {};`
	},

	{
		description: 'creates a computed property at start of literal with generator method afterwards when transpiling methods is disabled',

		options: { transforms: { conciseMethodProperty: false, generator: false } },

		input: `
			var obj = {
				[a]: 1,
				*b() {}
			};`,

		output: `
			var obj = {};
			obj[a] = 1;
			obj.b = function* () {};`
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
						...c
					};
				},
			};
		`,
		output: `
			var a = {};
			a[foo] = function (x, y) {
					return Object.assign({}, c);
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
			!function(foo) {
				var obj$1;

				return bar(( obj$1 = {}, obj$1[x - y] = obj, obj$1 ));
			};
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
	},

	{
		description: 'Puts helper variables in correct scope',

		input: `
			((x) => {var obj = 2; console.log([{[x]: 1}, obj]);})(3);
		`,
		output: `
			(function (x) {
			var obj$1;
var obj = 2; console.log([( obj$1 = {}, obj$1[x] = 1, obj$1 ), obj]);})(3);
		`
	},

	{
		description: 'spread and computed properties in arrow function',

		options: {
			objectAssign: 'Object.assign'
		},

		input: `
			v => v && { ...o, [k]: v };
		`,

		output: `
			!function(v) {
				var obj;

				return v && ( obj = Object.assign({}, o), obj[k] = v, obj );
			};
		`
	},

	{
		description:
			'spread and computed properties in arrow function, with the spread in the middle',

		options: {
			objectAssign: 'Object.assign'
		},

		input: `
			v => v && { p, ...o, [k]: v };
		`,

		output: `
			!function(v) {
				var obj;

				return v && ( obj = Object.assign({ p: p }, o), obj[k] = v, obj );
			};
		`
	},

	{
		description:
			'many alternating spread, computed, and normal properties in arrow function',

		options: {
			objectAssign: 'Object.assign'
		},

		input: `
			v => v && { p, ...o, q, [k]: v, r, ...s, t };
		`,

		output: `
			!function(v) {
				var obj;

				return v && ( obj = Object.assign({ p: p }, o), obj.q = q, obj[k] = v, obj.r = r, Object.assign(obj, s), obj.t = t, obj );
			};
		`
	},

	{
		description:
			'arrow function with nested spread and computed properties (bublejs/buble#212)',

		options: {
			objectAssign: 'Object.assign'
		},

		input: `
			setState(previousState => ({
				...previousState,
					field: {
						...previousState.field,
						[field]: true
					}
			}))
		`,

		output: `
			setState(function (previousState) {
				var obj, obj$1;

				return (( obj$1 = Object.assign({}, previousState), obj$1.field = ( obj = Object.assign({}, previousState.field), obj[field] = true, obj ), obj$1 ));
			})
		`
	},

	{
		description: 'nested spread and computed properties (bublejs/buble#163)',

		options: {
			objectAssign: 'Object.assign'
		},

		input: `
			({ ...o, [k]: { ...o, [k]: v } });
		`,

		output: `
			var obj, obj$1;

			(( obj$1 = Object.assign({}, o), obj$1[k] = ( obj = Object.assign({}, o), obj[k] = v, obj ), obj$1 ));
		`
	}
];
