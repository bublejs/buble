module.exports = [
	{
		description: 'disallows unicode flag in regex literals',
		input: `var regex = /x/u;`,
		error: /Regular expression unicode flag is not supported/
	},

	{
		description: 'disallows sticky flag in regex literals',
		input: `var regex = /x/y;`,
		error: /Regular expression sticky flag is not supported/
	}
];
