module.exports = [
	{
		description: 'destructures an identifier with an object pattern',
		input: `
			var { x, y } = point;`,
		output: `
			var x = point.x;
			var y = point.y;`
	},

	{
		description: 'destructures a non-identifier with an object pattern',
		input: `
			var { x, y } = getPoint();`,
		output: `
			var ref = getPoint();
			var x = ref.x;
			var y = ref.y;`
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
				var z = ref.y; if ( z === void 0 ) z = 1;

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
		input: `
			var [ x, y ] = point;`,
		output: `
			var x = point[0];
			var y = point[1];`
	},

	{
		description: 'destructures an identifier with a sparse array pattern',
		input: `
			var [ x, , z ] = point;`,
		output: `
			var x = point[0];
			var z = point[2];`
	},

	{
		description: 'destructures a non-identifier with an array pattern',
		input: `
			var [ x, y ] = getPoint();`,
		output: `
			var ref = getPoint();
			var x = ref[0];
			var y = ref[1];`
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
				var z = ref[1]; if ( z === void 0 ) z = 1;

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
		description: 'does not destructure parameters intelligently (#53)',

		input: `
			function drawRect ( { ctx, x1, y1, x2, y2 } ) {
				ctx.fillRect( x1, y1, x2 - x1, y2 - y1 );
			}

			function scale ([ d0, d1 ], [ r0, r1 ]) {
				const m = ( r1 - r0 ) / ( d1 - d0 );
				return function ( num ) {
					return r0 + ( num - d0 ) * m;
				}
			}`,

		output: `
			function drawRect ( ref ) {
				var ctx = ref.ctx;
				var x1 = ref.x1;
				var y1 = ref.y1;
				var x2 = ref.x2;
				var y2 = ref.y2;

				ctx.fillRect( x1, y1, x2 - x1, y2 - y1 );
			}

			function scale (ref, ref$1) {
				var d0 = ref[0];
				var d1 = ref[1];
				var r0 = ref$1[0];
				var r1 = ref$1[1];

				var m = ( r1 - r0 ) / ( d1 - d0 );
				return function ( num ) {
					return r0 + ( num - d0 ) * m;
				}
			}`
	},

	{
		description: 'does not destructure variable declarations intelligently (#53)',

		input: `
			var { foo: bar, baz } = obj;
			console.log( bar );
			console.log( baz );
			console.log( baz );`,

		output: `
			var bar = obj.foo;
			var baz = obj.baz;
			console.log( bar );
			console.log( baz );
			console.log( baz );`
	},

	{
		description: 'destructures variables in the middle of a declaration',

		input: `
			var a, { x, y } = getPoint(), b = x;
			console.log( x, y );`,

		output: `
			var a;
			var ref = getPoint();
			var x = ref.x;
			var y = ref.y;
			var b = x;
			console.log( x, y );`
	},

	{
		description: 'destructuring a destructured parameter',

		input: `
			function test ( { foo, bar } ) {
				const { x, y } = foo;
			}`,

		output: `
			function test ( ref ) {
				var foo = ref.foo;
				var bar = ref.bar;

				var x = foo.x;
				var y = foo.y;
			}`
	},

	{
		description: 'default value in destructured variable declaration (#37)',

		input: `
			var { name: value, description = null } = obj;
			console.log( value, description );`,

		output: `
			var value = obj.name;
			var description = obj.description; if ( description === void 0 ) description = null;
			console.log( value, description );`
	},

	{
		description: 'default values in destructured object parameter with a default value (#37)',

		input: `
			function foo ({ arg1 = 123, arg2 = 456 } = {}) {
				console.log( arg1, arg2 );
			}`,

		output: `
			function foo (ref) {
				if ( ref === void 0 ) ref = {};
				var arg1 = ref.arg1; if ( arg1 === void 0 ) arg1 = 123;
				var arg2 = ref.arg2; if ( arg2 === void 0 ) arg2 = 456;

				console.log( arg1, arg2 );
			}`
	},

	{
		description: 'destructures not replacing reference from parent scope',

		input: `
			function controller([element]) {
				const mapState = function ({ filter }) {
					console.log(element);
				};
			}`,

		output: `
			function controller(ref) {
				var element = ref[0];

				var mapState = function (ref) {
					var filter = ref.filter;

					console.log(element);
				};
			}`
	},

	{
		// solo: true,
		description: 'deep matching',

		input: `
			var { a: { b: c }, d: { e: f, g: h } } = x;`,

		output: `
			var c = x.a.b;
			var x_d = x.d;
			var f = x_d.e;
			var h = x_d.g`
	}

];
