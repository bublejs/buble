module.exports = [
	{
		description: 'disallows for...of statements',
		input: `for ( x of y ) {}`,
		error: /for\.\.\.of statements are not supported/
	}
];
