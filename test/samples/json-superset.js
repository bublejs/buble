module.exports = [
	{
		description: 'transpiles U+2028 LINE SEPARATOR',
		input: `const x = "a\u2028b\u1010"`,
		output: `var x = "a\\u2028b\u1010"`
	},
	{
		description: 'transpiles U+2029 PARAGRAPH SEPARATOR',
		input: `const x = "a\u2029b\u1010"`,
		output: `var x = "a\\u2029b\u1010"`
	}
]
