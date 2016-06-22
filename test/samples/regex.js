module.exports = [
	{
		description: 'transpiles regex with unicode flag',
		input: `var regex = /foo.bar/u;`,
		output: `var regex = /foo(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF])bar/;`
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
