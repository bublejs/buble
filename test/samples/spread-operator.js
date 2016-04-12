module.exports = [
	{
		description: 'disallows the spread operator (temporarily)',
		input: `foo( a, b, ...others );`,
		error: /The spread operator is not currently supported/
	}
];
