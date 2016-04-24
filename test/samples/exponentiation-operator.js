module.exports = [
	{
		description: 'transpiles an exponentiation operator',
		input: `x ** y`,
		output: `Math.pow( x, y )`
	},

	{
		description: 'transpiles an exponentiation assignment to a simple reference',
		input: `x **= y`,
		output: `x = Math.pow( x, y )`
	},

	{
		description: 'transpiles an exponentiation assignment to a simple parenthesized reference',
		input: `( x ) **= y`,
		output: `( x ) = Math.pow( x, y )`
	},

	{
		description: 'transpiles an exponentiation assignment to a rewritten simple reference',

		input: `
			let x = 1;

			if ( maybe ) {
				let x = 2;
				x **= y;
			}`,

		output: `
			var x = 1;

			if ( maybe ) {
				var x$1 = 2;
				x$1 = Math.pow( x$1, y );
			}`
	},

	{
		description: 'transpiles an exponentiation assignment to a simple member expression',

		input: `
			foo.bar **= y;`,

		output: `
			foo.bar = Math.pow( foo.bar, y );`
	},

	{
		description: 'transpiles an exponentiation assignment to a simple computed member expression',

		input: `
			foo[ bar ] **= y;`,

		output: `
			foo[ bar ] = Math.pow( foo[bar], y );`
	},

	{
		description: 'transpiles an exponentiation assignment to a complex reference',

		input: `
			foo[ bar() ] **= y;`,

		output: `
			var property = bar();
			foo[property] = Math.pow( foo[property], y );`
	},

	{
		description: 'transpiles an exponentiation assignment to a contrivedly complex reference',

		input: `
			foo[ bar() ][ baz() ] **= y;`,

		output: `
			var object = foo[ bar() ];
			var property = baz();
			object[property] = Math.pow( object[property], y );`
	},

	{
		description: 'transpiles an exponentiation assignment to a contrivedly complex reference (that is not a top-level statement)',

		input: `
			var baz = 1, lolwut = foo[ bar() ][ baz * 2 ] **= y;`,

		output: `
			var object, property;
			var baz = 1, lolwut = ( object = foo[ bar() ], property = baz * 2, object[property] = Math.pow( object[property], y ) );`
	},

	{
		description: 'handles pathological bastard case',

		input: `
			let i;

			if ( maybe ) {
				for ( let i = 1.1; i < 1e6; i **= i ) {
					setTimeout( function () {
						console.log( i );
					}, i );
				}
			}`,

		output: `
			var i;

			if ( maybe ) {
				var loop = function ( i ) {
					setTimeout( function () {
						console.log( i );
					}, i );
				};

				for ( var i$1 = 1.1; i$1 < 1e6; i$1 = Math.pow( i$1, i$1 ) ) loop( i$1 );
			}`
	}
];
