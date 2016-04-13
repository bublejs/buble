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
	}
];
