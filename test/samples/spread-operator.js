module.exports = [
	{
		description: 'transpiles a lone spread operator',
		input: `var clone = [ ...arr ]`,
		output: `var clone = [].concat( arr )`
	},

	{
		description: 'transpiles a spread operator with other values',
		input: `var list = [ a, b, ...remainder ]`,
		output: `var list = [ a, b ].concat( remainder )` // TODO preserve whitespace conventions
	},

	{
		description: 'transpiles a lone spread operator in a method call',
		input: `var max = Math.max( ...values );`,
		output: `var max = Math.max.apply( Math, values );`
	},

	{
		description: 'transpiles a spread operator in a method call with other arguments',
		input: `var max = Math.max( 0, ...values );`,
		output: `var max = Math.max.apply( Math, [ 0 ].concat( values ) );`
	},

	{
		description: 'transpiles a spread operator in a method call of an expression',

		input: `
			( foo || bar ).baz( ...values );`,

		output: `
			var ref = ( foo || bar );
			ref.baz.apply( ref, values );`
	},

	{
		description: 'transpiles a lone spread operator in a function call',
		input: `log( ...values );`,
		output: `log.apply( void 0, values );`
	},

	{
		description: 'transpiles a spread operator in a function call with other arguments',
		input: `sprintf( str, ...values );`,
		output: `sprintf.apply( void 0, [ str ].concat( values ) );`
	},

	{
		description: 'transpiles a spread operator in an expression call',
		input: `( foo || bar )( ...values );`,
		output: `( foo || bar ).apply( void 0, values );`
	},

	{
		description: 'can be disabled in array expressions `transforms.spreadRest: false`',
		options: { transforms: { spreadRest: false } },
		input: `var chars = [ ...string ]`,
		output: `var chars = [ ...string ]`
	},

	{
		description: 'can be disabled in call expressions with `transforms.spreadRest: false`',
		options: { transforms: { spreadRest: false } },
		input: `var max = Math.max( ...values );`,
		output: `var max = Math.max( ...values );`
	},

	{
		description: 'transpiles multiple spread operators in an array',
		input: `var arr = [ ...a, ...b, ...c ];`,
		output: `var arr = a.concat( b, c );`
	},

	{
		description: 'transpiles mixture of spread and non-spread elements',
		input: `var arr = [ ...a, b, ...c, d ];`,
		output: `var arr = a.concat( [b], c, [d] );`
	},

	{
		description: 'transpiles ...arguments',

		input: `
			function foo () {
				var args = [ ...arguments ];
				return args;
			}`,

		output: `
			function foo () {
				var args = ( arguments.length === 1 ? [ arguments[0] ] : Array.apply( null, arguments ) );
				return args;
			}`
	},

	{
		description: 'transpiles ...arguments in middle of array',

		input: `
			function foo () {
				var arr = [ a, ...arguments, b ];
				return arr;
			}`,

		output: `
			function foo () {
				var arr = [ a ].concat( Array.apply( null, arguments ), [b] );
				return arr;
			}`
	},

	{
		description: 'transpiles multiple spread operators in function call',
		input: `var max = Math.max( ...theseValues, ...thoseValues );`,
		output: `var max = Math.max.apply( Math, theseValues.concat( thoseValues ) );`
	},

	{
		description: 'transpiles mixture of spread and non-spread operators in function call',
		input: `var max = Math.max( ...a, b, ...c, d );`,
		output: `var max = Math.max.apply( Math, a.concat( [b], c, [d] ) );`
	},

	{
		description: 'transpiles ...arguments in function call',

		input: `
			function foo () {
				return Math.max( ...arguments );
			}`,

		output: `
			function foo () {
				return Math.max.apply( Math, arguments );
			}`
	},

	{
		description: 'transpiles ...arguments in middle of function call',

		input: `
			function foo () {
				return Math.max( a, ...arguments, b );
			}`,

		output: `
			function foo () {
				return Math.max.apply( Math, [ a ].concat( Array.apply( null, arguments ), [b] ) );
			}`
	}
];
