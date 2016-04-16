module.exports = [
	{
		description: 'transpiles solo rest parameters',

		input: `
			function foo ( ...theRest ) {
				console.log( theRest );
			}`,

		output: `
			function foo () {
				var theRest = [], len = arguments.length;
				while ( len-- ) theRest[ len ] = arguments[ len ];

				console.log( theRest );
			}`
	},

	{
		description: 'transpiles rest parameters following other parameters',

		input: `
			function foo ( a, b, c, ...theRest ) {
				console.log( theRest );
			}`,

		output: `
			function foo ( a, b, c ) {
				var theRest = [], len = arguments.length - 3;
				while ( len-- > 0 ) theRest[ len ] = arguments[ len + 3 ];

				console.log( theRest );
			}`
	},

	{
		description: 'can be disabled with `transforms.spreadRest === false`',
		options: { transforms: { spreadRest: false } },

		input: `
			function foo ( ...list ) {
				// code goes here
			}`,

		output: `
			function foo ( ...list ) {
				// code goes here
			}`
	}
];
