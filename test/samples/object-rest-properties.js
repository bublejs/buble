module.exports = [
	{
		description: 'transpiles object rest properties',
		input: `let {...x} = z;`,
		output: `let x = _without(z, []);`
  },
	{
		description: 'transpiles object rest properties',
		input: `var { a, b, ...rest } = some;`,
		output: `var a = some.a; var b = some.b; var rest = _objectWithoutProperties(some, ['a', 'b']);`
	}
];
