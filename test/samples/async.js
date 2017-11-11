module.exports = [
	{
		description: 'supports async as property name',

		input: `
			({async, foo})`,

		output: `
			({async: async, foo: foo})`
	}
];
