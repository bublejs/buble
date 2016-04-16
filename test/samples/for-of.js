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
	}
];
