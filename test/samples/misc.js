module.exports = [
	{
		description: 'handles empty return',
		input: `
			function foo () {
				return;
			}`,
		output: `
			function foo () {
				return;
			}`
	},

	{
		description: 'allows break statement inside switch',

		input: `
			switch ( foo ) {
				case bar:
				console.log( 'bar' );
				break;

				default:
				console.log( 'default' );
			}`,

		output: `
			switch ( foo ) {
				case bar:
				console.log( 'bar' );
				break;

				default:
				console.log( 'default' );
			}`
	},

	{
		description: 'double var is okay',

		input: `
			function foo () {
				var x = 1;
				var x = 2;
			}`,

		output: `
			function foo () {
				var x = 1;
				var x = 2;
			}`
	},

	{
		description: 'var followed by let is not okay',

		input: `
			function foo () {
				var x = 1;
				let x = 2;
			}`,

		error: /x is already declared/
	},

	{
		description: 'let followed by var is not okay',

		input: `
			function foo () {
				let x = 1;
				var x = 2;
			}`,

		error: /x is already declared/
	},

	{
		description: 'does not get confused about keys of Literal node',

		input: `
			console.log( null );
			console.log( 'some string' );
			console.log( null );`,

		output: `
			console.log( null );
			console.log( 'some string' );
			console.log( null );`
	}
];
