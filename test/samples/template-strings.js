module.exports = [
	{
		description: 'transpiles an untagged template literal',
		input: 'var str = `foo${bar}baz`;',
		output: `var str = "foo" + bar + "baz";`
	},

	{
		description: 'handles arbitrary whitespace inside template elements',
		input: 'var str = `foo${ bar }baz`;',
		output: `var str = "foo" + bar + "baz";`
	},

	{
		description: 'transpiles an untagged template literal containing complex expressions',
		input: 'var str = `foo${bar + baz}qux`;',
		output: `var str = "foo" + (bar + baz) + "qux";`
	},

	{
		description: 'transpiles a template literal containing single quotes',
		input: "var singleQuote = `'`;",
		output: `var singleQuote = "'";`
	},

	{
		description: 'transpiles a template literal containing double quotes',
		input: 'var doubleQuote = `"`;',
		output: `var doubleQuote = "\\"";`
	},

	{
		description: 'does not transpile tagged template literals',
		input: 'var str = x`y`',
		error: /Tagged template strings are not supported/
	},

	{
		description: 'transpiles tagged template literals with `transforms.dangerousTaggedTemplateString = true`',
		options: { transforms: { dangerousTaggedTemplateString: true } },
		input: 'var str = x`y`',
		output: `var str = x(["y"]);`
	},

	{
		description: 'parenthesises template strings as necessary',
		input: 'var str = `x${y}`.toUpperCase();',
		output: 'var str = ("x" + y).toUpperCase();'
	},

	{
		description: 'does not parenthesise template strings in arithmetic expressions',
		input: 'var str = `x${y}` + z; var str2 = `x${y}` * z;',
		output: 'var str = "x" + y + z; var str2 = ("x" + y) * z;'
	},

	{
		description: 'can be disabled with `transforms.templateString === false`',
		options: { transforms: { templateString: false } },
		input: 'var a = `a`, b = c`b`;',
		output: 'var a = `a`, b = c`b`;'
	}
];
