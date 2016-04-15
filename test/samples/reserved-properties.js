module.exports = [
	{
		description: 'rewrites member expressions that are reserved words',
		options: { transforms: { reservedProperties: true } },
		input: `foo.then + foo.catch`,
		output: `foo.then + foo['catch']`
	},

	{
		description: 'rewrites object literal properties that are reserved words',
		options: { transforms: { reservedProperties: true } },
		input: `obj = { then: 1, catch: 2 }`,
		output: `obj = { then: 1, 'catch': 2 }`
	},

	{
		description: 'does not rewrite member expressions by default',
		input: `foo.then + foo.catch`,
		output: `foo.then + foo.catch`
	},

	{
		description: 'does not rewrite object literal properties by default',
		input: `obj = { then: 1, catch: 2 }`,
		output: `obj = { then: 1, catch: 2 }`
	}
];
