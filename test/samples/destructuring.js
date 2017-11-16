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
		description:
			'can be disabled in declarations with `transforms.destructuring === false`',
		options: { transforms: { destructuring: false } },
		input: `var { x, y } = point;`,
		output: `var { x, y } = point;`
	},

	{
		description:
			'can be disabled in function parameters with `transforms.parameterDestructuring === false`',
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
		description:
			'does not destructure variable declarations intelligently (#53)',

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
		description:
			'default values in destructured object parameter with a default value (#37)',

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
		description: 'deep matching with object patterns',

		input: `
			var { a: { b: c }, d: { e: f, g: h = 1 } } = x;`,

		output: `
			var c = x.a.b;
			var x_d = x.d;
			var f = x_d.e;
			var h = x_d.g; if ( h === void 0 ) h = 1;`
	},

	{
		description: 'deep matching with string literals in object patterns',

		input: `
			var { a, 'b-1': c } = x;`,

		output: `
			var a = x.a;
			var c = x['b-1'];`
	},

	{
		description: 'deep matching with object patterns and reference',

		input: `
			var { a: { b: c }, d: { e: f, g: h } } = x();`,

		output: `
			var ref = x();
			var c = ref.a.b;
			var ref_d = ref.d;
			var f = ref_d.e;
			var h = ref_d.g;`
	},

	{
		description: 'deep matching with array patterns',

		input: `
			var [[[a]], [[b, c = 1]]] = x;`,

		output: `
			var a = x[0][0][0];
			var x_1_0 = x[1][0];
			var b = x_1_0[0];
			var c = x_1_0[1]; if ( c === void 0 ) c = 1;`
	},

	{
		description: 'deep matching with sparse array',

		input: `
			function foo ( [[[,x = 3] = []] = []] = [] ) {
				console.log( x );
			}`,

		output: `
			function foo ( ref ) {
				if ( ref === void 0 ) ref = [];
				var ref_0 = ref[0]; if ( ref_0 === void 0 ) ref_0 = [];
				var ref_0_0 = ref_0[0]; if ( ref_0_0 === void 0 ) ref_0_0 = [];
				var x = ref_0_0[1]; if ( x === void 0 ) x = 3;

				console.log( x );
			}`
	},

	{
		description: 'deep matching in parameters',

		input: `
			function foo ({ a: { b: c }, d: { e: f, g: h } }) {
				console.log( c, f, h );
			}`,

		output: `
			function foo (ref) {
				var c = ref.a.b;
				var ref_d = ref.d;
				var f = ref_d.e;
				var h = ref_d.g;

				console.log( c, f, h );
			}`
	},

	{
		description: 'destructured object assignment with computed properties',
		input: `
			let one, two, three, four;
			({ [FirstProp]: one, [SecondProp]: two = 'Too', 3: three, Fore: four } = x);
		`,
		output: `
			var one, two, three, four;
			var assign;
			((assign = x, one = assign[FirstProp], two = assign[SecondProp], two = two === void 0 ? 'Too' : two, three = assign[3], four = assign.Fore));
		`
	},

	{
		description: 'destructured object declaration with computed properties',
		input: `
			var { [FirstProp]: one, [SecondProp]: two = 'Too', 3: three, Fore: four } = x;
		`,
		output: `
			var one = x[FirstProp];
			var two = x[SecondProp]; if ( two === void 0 ) two = 'Too';
			var three = x[3];
			var four = x.Fore;
		`
	},

	{
		description: 'destructured object with computed properties in parameters',
		input: `
			function foo({ [FirstProp]: one, [SecondProp]: two = 'Too', 3: three, Fore: four } = x) {
				console.log(one, two, three, four);
			}
		`,
		output: `
			function foo(ref) {
				if ( ref === void 0 ) ref = x;
				var one = ref[FirstProp];
				var two = ref[SecondProp]; if ( two === void 0 ) two = 'Too';
				var three = ref[3];
				var four = ref.Fore;

				console.log(one, two, three, four);
			}
		`
	},

	{
		description: 'deep matching in parameters with computed properties',

		input: `
			function foo ({ [a]: { [b]: c }, d: { 'e': f, [g]: h }, [i + j]: { [k + l]: m, n: o } }) {
				console.log( c, f, h, m, o );
			}`,

		output: `
			function foo (ref) {
				var c = ref[a][b];
				var ref_d = ref.d;
				var f = ref_d['e'];
				var h = ref_d[g];
				var ref_i_j = ref[i + j];
				var m = ref_i_j[k + l];
				var o = ref_i_j.n;

				console.log( c, f, h, m, o );
			}`
	},

	{
		description: 'array destructuring declaration with rest element',

		input: `
			const [a, ...b] = [1, 2, 3, 4];
			console.log(a, b);
		`,
		output: `
			var ref = [1, 2, 3, 4];
			var a = ref[0];
			var b = ref.slice(1);
			console.log(a, b);
		`
	},

	{
		description: 'array destructuring declaration with complex rest element',

		input: `
			const x = [1, 2, {r: 9}, 3], [a, ...[, {r: b, s: c = 4} ]] = x;
			console.log(a, b, c);
		`,
		output: `
			var x = [1, 2, {r: 9}, 3];
			var a = x[0];
			var x_slice_1_1 = x.slice(1)[1];
			var b = x_slice_1_1.r;
			var c = x_slice_1_1.s; if ( c === void 0 ) c = 4;
			console.log(a, b, c);
		`
	},

	{
		description: 'destructuring function parameters with array rest element',

		input: `
			function foo([a, ...[, {r: b, s: c = 4} ]]) {
				console.log(a, b, c);
			}
			foo( [1, 2, {r: 9}, 3] );
		`,
		output: `
			function foo(ref) {
				var a = ref[0];
				var ref_slice_1_1 = ref.slice(1)[1];
				var b = ref_slice_1_1.r;
				var c = ref_slice_1_1.s; if ( c === void 0 ) c = 4;

				console.log(a, b, c);
			}
			foo( [1, 2, {r: 9}, 3] );
		`
	},

	{
		description: 'destructuring array assignment with complex rest element',

		input: `
			let x = [1, 2, {r: 9}, {s: ["table"]} ];
			let a, b, c, d;
			([a, ...[ , {r: b}, {r: c = "nothing", s: [d] = "nope"} ]] = x);
			console.log(a, b, c, d);
		`,
		output: `
			var x = [1, 2, {r: 9}, {s: ["table"]} ];
			var a, b, c, d;
			var assign, array, obj, temp;
			((assign = x, a = assign[0], array = assign.slice(1), b = array[1].r, obj = array[2], c = obj.r, c = c === void 0 ? "nothing" : c, temp = obj.s, temp = temp === void 0 ? "nope" : temp, d = temp[0]));
			console.log(a, b, c, d);
		`
	},

	{
		description: 'destructuring array rest element within an object property',

		input: `
			let foo = ({p: [x, ...y] = [6, 7], q: [...z] = [8]} = {}) => {
				console.log(x, y, z);
			};
			foo({p: [1, 2, 3], q: [4, 5]});
			foo({q: []} );
			foo();
		`,
		output: `
			var foo = function (ref) {
				if ( ref === void 0 ) ref = {};
				var ref_p = ref.p; if ( ref_p === void 0 ) ref_p = [6, 7];
				var ref_p$1 = ref_p;
				var x = ref_p$1[0];
				var y = ref_p$1.slice(1);
				var ref_q = ref.q; if ( ref_q === void 0 ) ref_q = [8];
				var z = ref_q.slice(0);

				console.log(x, y, z);
			};
			foo({p: [1, 2, 3], q: [4, 5]});
			foo({q: []} );
			foo();
		`
	},

	{
		description: 'transpiles destructuring assignment of an array',
		input: `
			[x, y] = [1, 2];`,
		output: `
			var assign;
			(assign = [1, 2], x = assign[0], y = assign[1]);`
	},

	{
		description:
			'transpiles destructuring assignment of an array with a default value',
		input: `
			[x = 4, y] = [1, 2];`,
		output: `
			var assign;
			(assign = [1, 2], x = assign[0], x = x === void 0 ? 4 : x, y = assign[1]);`
	},

	{
		description: 'transpiles nested destructuring assignment of an array',
		input: `
			[[x], y] = [1, 2];`,
		output: `
			var assign;
			(assign = [1, 2], x = assign[0][0], y = assign[1]);`
	},

	{
		description:
			'transpiles nested destructuring assignment of an array without evaluating a memberexpr twice',
		input: `
			[[x, z], y] = [1, 2];`,
		output: `
			var assign, array;
			(assign = [1, 2], array = assign[0], x = array[0], z = array[1], y = assign[1]);`
	},

	{
		description:
			'transpiles nested destructuring assignment of an array with a default',
		input: `
			[[x] = [], y] = [1, 2];`,
		output: `
			var assign, temp;
			(assign = [1, 2], temp = assign[0], temp = temp === void 0 ? [] : temp, x = temp[0], y = assign[1]);`
	},

	{
		description: 'leaves member expression patterns intact',
		input: `
			[x, y.z] = [1, 2];`,
		output: `
			var assign;
			(assign = [1, 2], x = assign[0], y.z = assign[1]);`
	},

	{
		description: 'only assigns to member expressions once',
		input: `
			[x, y.z = 3] = [1, 2];`,
		output: `
			var assign, temp;
			(assign = [1, 2], x = assign[0], temp = assign[1], temp = temp === void 0 ? 3 : temp, y.z = temp);`
	},

	{
		description: 'transpiles destructuring assignment of an object',
		input: `
			({x, y} = {x: 1});`,
		output: `
			var assign;
			((assign = {x: 1}, x = assign.x, y = assign.y));`
	},

	{
		description:
			'transpiles destructuring assignment of an object where key and pattern names differ',
		input: `
			({x, y: z} = {x: 1});`,
		output: `
			var assign;
			((assign = {x: 1}, x = assign.x, z = assign.y));`
	},

	{
		description: 'transpiles nested destructuring assignment of an object',
		input: `
			({x, y: {z}} = {x: 1});`,
		output: `
			var assign;
			((assign = {x: 1}, x = assign.x, z = assign.y.z));`
	},

	{
		description:
			'transpiles destructuring assignment of an object with a default value',
		input: `
			({x, y = 4} = {x: 1});`,
		output: `
			var assign;
			((assign = {x: 1}, x = assign.x, y = assign.y, y = y === void 0 ? 4 : y));`
	},

	{
		description: 'only evaluates a sub-object once',
		input: `
			({x, y: {z, q}} = {x: 1});`,
		output: `
			var assign, obj;
			((assign = {x: 1}, x = assign.x, obj = assign.y, z = obj.z, q = obj.q));`
	},

	{
		description: "doesn't create an object temporary unless necessary",
		input: `
			({x, y: {z}} = {x: 1});`,
		output: `
			var assign;
			((assign = {x: 1}, x = assign.x, z = assign.y.z));`
	},

	{
		description: 'lifts its variable declarations out of the expression',
		input: `
			foo();
			if ( bar([x, y] = [1, 2]) ) {
				baz();
			}`,
		output: `
			foo();
			var assign;
			if ( bar((assign = [1, 2], x = assign[0], y = assign[1], assign)) ) {
				baz();
			}`
	},

	{
		description: 'puts its scratch variables in the parent scope',
		input: `
			function foo() {
				[x, y] = [1, 2];
			}`,
		output: `
			function foo() {
				var assign;
				(assign = [1, 2], x = assign[0], y = assign[1]);
			}`
	},

	{
		description: 'array destructuring default with template string (#145)',

		input: 'const [ foo = `${baz() - 4}` ] = bar;',

		output: `var foo = bar[0]; if ( foo === void 0 ) foo = "" + (baz() - 4);`
	},

	{
		description: 'object destructuring default with template string (#145)',

		input: 'const { foo = `${baz() - 4}` } = bar;',

		output: `var foo = bar.foo; if ( foo === void 0 ) foo = "" + (baz() - 4);`
	},

	{
		description: 'array destructuring with multiple defaults with hole',

		// FIXME: unnecessary parens needed around complex defaults due to buble bugs
		input: `
			let [
				a = \`A\${baz() - 4}\`,
				, /* hole */
				c = (x => -x),
				d = ({ r: 5, [h()]: i }),
			] = [ "ok" ];
		`,
		output: `
			var obj;

			var ref = [ "ok" ];
			var a = ref[0]; if ( a === void 0 ) a = "A" + (baz() - 4);
			var c = ref[2]; if ( c === void 0 ) c = (function (x) { return -x; });
			var d = ref[3]; if ( d === void 0 ) d = (( obj = { r: 5 }, obj[h()] = i, obj ));
		`
	},

	{
		description: 'object destructuring with multiple defaults',

		// FIXME: unnecessary parens needed around complex defaults due to buble bugs
		input: `
			let {
				a = \`A\${baz() - 4}\`,
				c = (x => -x),
				d = ({ r: 5, [1 + 1]: 2, [h()]: i }),
			} = { b: 3 };
		`,
		output: `
			var obj;

			var ref = { b: 3 };
			var a = ref.a; if ( a === void 0 ) a = "A" + (baz() - 4);
			var c = ref.c; if ( c === void 0 ) c = (function (x) { return -x; });
			var d = ref.d; if ( d === void 0 ) d = (( obj = { r: 5 }, obj[1 + 1] = 2, obj[h()] = i, obj ));
		`
	},

	{
		description: 'destrucuring assignments requiring rvalues',

		input: `
			class Point {
				set ( array ) {
					return [ this.x, this.y ] = array;
				}
			}

			let a, b, c = [ 1, 2, 3 ];
			console.log( [ a, b ] = c );
		`,
		output: `
			var Point = function Point () {};

			Point.prototype.set = function set ( array ) {
				var assign;
					return (assign = array, this.x = assign[0], this.y = assign[1], assign);
			};

			var a, b, c = [ 1, 2, 3 ];
			var assign;
			console.log( (assign = c, a = assign[0], b = assign[1], assign) );
		`
	},

	{
		description: 'destrucuring assignments not requiring rvalues',

		input: `
			class Point {
				set ( array ) {
					[ this.x, this.y ] = array;
				}
			}

			let a, b, c = [ 1, 2, 3 ];
			[ a, b ] = c;
		`,
		output: `
			var Point = function Point () {};

			Point.prototype.set = function set ( array ) {
				var assign;
					(assign = array, this.x = assign[0], this.y = assign[1]);
			};

			var a, b, c = [ 1, 2, 3 ];
			var assign;
			(assign = c, a = assign[0], b = assign[1]);
		`
	},

	{
		description: 'destructures with computed property',

		input: `
			const { a, b } = { ['a']: 1 };
		`,

		output: `
			var obj;

			var ref = ( obj = {}, obj['a'] = 1, obj );
			var a = ref.a;
			var b = ref.b;
		`
	}
];
