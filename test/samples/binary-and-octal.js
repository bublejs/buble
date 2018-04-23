module.exports = [
	{
		description: 'transpiles binary numbers',

		input: `
			var num1 = 0b111110111;
			var num2 = 0B111110111;
			var str = '0b111110111';`,

		output: `
			var num1 = 503;
			var num2 = 503;
			var str = '0b111110111';`
	},

	{
		description: 'transpiles octal numbers',

		input: `
			var num1 = 0o767;
			var num2 = 0O767;
			var str = '0o767';`,

		output: `
			var num1 = 503;
			var num2 = 503;
			var str = '0o767';`
	},

	{
		description: 'can be disabled with `transforms.numericLiteral: false`',
		options: { transforms: { numericLiteral: false } },
		input: '0b111110111',
		output: '0b111110111'
	}
];
