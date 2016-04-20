module.exports = [
	{
		description: 'disallows for...of statements',
		input: `for ( x of y ) {}`,
		error: /for\.\.\.of statements are not supported/
	},

	{
		description: 'ignores for...of with `transforms.forOf === false`',
		options: { transforms: { forOf: false } },
		input: `for ( x of y ) {}`,
		output: `for ( x of y ) {}`
	},

	{
		description: 'transpiles for...of with array assumption with `transforms.dangerousForOf`',
		options: { transforms: { dangerousForOf: true } },

		input: `
			for ( let member of array ) {
				doSomething( member );
			}`,

		output: `
			for ( var i = 0, list = array; i < list.length; i += 1 ) {
				var member = list[i];

				doSomething( member );
			}`
	},

	{
		description: 'transpiles for...of with expression',
		options: { transforms: { dangerousForOf: true } },

		input: `
			for ( let member of [ 'a', 'b', 'c' ] ) {
				doSomething( member );
			}`,

		output: `
			for ( var i = 0, list = [ 'a', 'b', 'c' ]; i < list.length; i += 1 ) {
				var member = list[i];

				doSomething( member );
			}`
	},

	{
		description: 'transpiles for...of that needs to be rewritten as function',
		options: { transforms: { dangerousForOf: true } },

		input: `
			for ( let member of [ 'a', 'b', 'c' ] ) {
				setTimeout( function () {
					doSomething( member );
				}, i * 100 );
			}`,

		output: `
			var loop = function ( i, member ) {
				setTimeout( function () {
					doSomething( member );
				}, i * 100 );
			};

			for ( var i = 0, list = [ 'a', 'b', 'c' ]; i < list.length; i += 1 ) loop( i, list[i] );`
	}
];
