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
	},

	{
		description: 'u flag is ignored with `transforms.unicodeRegExp === false`',
		options: { transforms: { unicodeRegExp: false } },
		input: `var regex = /x/u;`,
		output: `var regex = /x/u;`
	},

	{
		description: 'y flag is ignored with `transforms.stickyRegExp === false`',
		options: { transforms: { stickyRegExp: false } },
		input: `var regex = /x/y;`,
		output: `var regex = /x/y;`
	}
];
