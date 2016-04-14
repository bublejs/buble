module.exports = [
	{
		description: 'transpiles a lone spread operator',
		input: `var chars = [ ...string ]`,
		output: `var chars = [].concat( string )`
	},

	{
		description: 'transpiles a spread operator with other values',
		input: `var list = [ a, b, ...remainder ]`,
		output: `var list = [ a, b ].concat( remainder )`
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
		skip: true,
		description: 'transpiles a spread operator in a method call of an expression',

		input: `
			( foo || bar ).baz( ...values );`,

		output: `
			var ref;
			( ref = foo || bar ).baz.apply( ref, values );`
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
	}

	// TODO expression callee
];
