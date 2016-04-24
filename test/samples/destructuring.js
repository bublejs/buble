module.exports = [
	{
		description: 'destructures an identifier with an object pattern',
		input: `var { x, y } = point;`,
		output: `var x = point.x, y = point.y;`
	},

	{
		description: 'destructures a non-identifier with an object pattern',
		input: `var { x, y } = getPoint();`,
		output: `var ref = getPoint(), x = ref.x, y = ref.y;`
	},

	{
		description: 'destructures a parameter with an object pattern',

		input: `
			function pythag ( { x, y: z = 1 } ) {
				return Math.sqrt( x * x + z * z );
			}`,

		output: `
			function pythag ( ref ) {
				var x = ref.x;
				var ref_y = ref.y, z = ref_y === void 0 ? 1 : ref_y;

				return Math.sqrt( x * x + z * z );
			}`
	},

	{
		description: 'uses different name than the property in a declaration',
		input: `var { foo: bar } = obj;`,
		output: `var bar = obj.foo;`
	},

	{
		description: 'destructures an identifier with an array pattern',
		input: `var [ x, y ] = point;`,
		output: `var x = point[0], y = point[1];`
	},

	{
		description: 'destructures an identifier with a sparse array pattern',
		input: `var [ x, , z ] = point;`,
		output: `var x = point[0], z = point[2];`
	},

	{
		description: 'destructures a non-identifier with an array pattern',
		input: `var [ x, y ] = getPoint();`,
		output: `var ref = getPoint(), x = ref[0], y = ref[1];`
	},

	{
		description: 'destructures a parameter with an array pattern',

		input: `
			function pythag ( [ x, z = 1 ] ) {
				return Math.sqrt( x * x + z * z );
			}`,

		output: `
			function pythag ( ref ) {
				var x = ref[0];
				var ref_1 = ref[1], z = ref_1 === void 0 ? 1 : ref_1;

				return Math.sqrt( x * x + z * z );
			}`
	},

	{
		description: 'disallows compound destructuring in declarations',
		input: `var { a: { b: c } } = d;`,
		error: /Compound destructuring is not supported/
	},

	{
		description: 'disallows compound destructuring in parameters',
		input: `function foo ( { a: { b: c } } ) {}`,
		error: /Compound destructuring is not supported/
	},

	{
		description: 'disallows array pattern in assignment (temporary)',
		input: `[ a, b ] = [ b, a ]`,
		error: /Destructuring assignments are not currently supported. Coming soon!/
	},

	{
		description: 'can be disabled in declarations with `transforms.destructuring === false`',
		options: { transforms: { destructuring: false } },
		input: `var { x, y } = point;`,
		output: `var { x, y } = point;`
	},

	{
		description: 'can be disabled in function parameters with `transforms.parameterDestructuring === false`',
		options: { transforms: { parameterDestructuring: false } },
		input: `function foo ({ x, y }) {}`,
		output: `function foo ({ x, y }) {}`
	},

	{
		description: 'destructures parameters intelligently (#17)',

		input: `
			function drawRect ( { ctx, x1, y1, x2, y2 } ) {
				ctx.fillRect( x1, y1, x2 - x1, y2 - y1 );
			}`,

		output: `
			function drawRect ( ref ) {
				var x1 = ref.x1;
				var y1 = ref.y1;

				ref.ctx.fillRect( x1, y1, ref.x2 - x1, ref.y2 - y1 );
			}`
	}
];
