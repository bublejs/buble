module.exports = [
	{
		description: 'transpiles a lone spread operator',
		input: `var clone = [ ...arr ]`,
		output: `var clone = [].concat( arr )`
	},

	{
		description: 'transpiles a spread operator with other values',
		input: `var list = [ a, b, ...remainder ]`,
		output: `var list = [ a, b ].concat( remainder )` // TODO preserve whitespace conventions
	},

	{
		description: 'transpiles a lone spread operator in a method call',
		input: `var max = Math.max( ...values );`,
		output: `var max = Math.max.apply( Math, values );`
	},

	{
		description: 'transpiles a spread operator in a method call with other arguments',
		input: `var max = Math.max( 0, ...values );`,
		output: `var max = Math.max.apply( Math, [ 0 ].concat( values ) );`
	},

	{
		description: 'transpiles a spread operator in a method call of an expression',

		input: `
			( foo || bar ).baz( ...values );`,

		output: `
			(ref = ( foo || bar )).baz.apply( ref, values );
			var ref;`
	},

	{
		description: 'transpiles a spread operator in a method call of this (issue #100)',

		input: `
			this.baz( ...values );`,

		output: `
			this.baz.apply( this, values );`
	},

	{
		description: 'transpiles a spread operator in an expression method call within an if',

		input: `
			var result;
			if ( ref )
				result = expr().baz( ...values );
			process( result );`,

		output: `
			var result;
			if ( ref )
				result = (ref$1 = expr()).baz.apply( ref$1, values );
			process( result );
			var ref$1;`
	},

	{
		description: 'transpiles spread operators in expression method calls within a function',

		input: `
			function foo() {
				stuff();
				if ( ref )
					return expr().baz( ...values );
				return (up || down).bar( ...values );
			}`,
		output: `
			function foo() {
				stuff();
				if ( ref )
					return (ref$1 = expr()).baz.apply( ref$1, values );
				return (ref$2 = (up || down)).bar.apply( ref$2, values );
				var ref$2;
				var ref$1;
			}`
	},

	{
		description: 'transpiles spread operators in a complex nested scenario',

		input: `
			function ref() {
				stuff();
				if ( ref$1 )
					return expr().baz( a, ...values, (up || down).bar( c, ...values, d ) );
				return other();
			}`,
		output: `
			function ref() {
				stuff();
				if ( ref$1 )
					return (ref = expr()).baz.apply( ref, [ a ].concat( values, [(ref$2 = (up || down)).bar.apply( ref$2, [ c ].concat( values, [d] ) )] ) );
				return other();
				var ref$2;
				var ref;
			}`
	},

	{
		description: 'transpiles spread operators in issue #92',

		input: `
			var adder = {
				add(...numbers) {
					return numbers.reduce((a, b) => a + b, 0)
				},
				prepare() {
					return this.add.bind(this, ...arguments)
				}
			}`,
		output: `
			var adder = {
				add: function add() {
					var numbers = [], len = arguments.length;
					while ( len-- ) numbers[ len ] = arguments[ len ];

					return numbers.reduce(function (a, b) { return a + b; }, 0)
				},
				prepare: function prepare() {
					var i = arguments.length, argsArray = Array(i);
					while ( i-- ) argsArray[i] = arguments[i];

					return (ref = this.add).bind.apply(ref, [ this ].concat( argsArray ))
					var ref;
				}
			}`
	},

	{
		description: 'transpiles spread operators with template literals (issue #99)',
		input: 'console.log( `%s ${label}:`, `${color}`, ...args );',
		output: 'console.log.apply( console, [ ("%s " + label + ":"), ("" + color) ].concat( args ) );'
	},

	{
		description: 'transpiles a lone spread operator in a function call',
		input: `log( ...values );`,
		output: `log.apply( void 0, values );`
	},

	{
		description: 'transpiles a spread operator in a function call with other arguments',
		input: `sprintf( str, ...values );`,
		output: `sprintf.apply( void 0, [ str ].concat( values ) );`
	},

	{
		description: 'transpiles a spread operator in an expression call',
		input: `( foo || bar )( ...values );`,
		output: `( foo || bar ).apply( void 0, values );`
	},

	{
		description: 'can be disabled in array expressions `transforms.spreadRest: false`',
		options: { transforms: { spreadRest: false } },
		input: `var chars = [ ...string ]`,
		output: `var chars = [ ...string ]`
	},

	{
		description: 'can be disabled in call expressions with `transforms.spreadRest: false`',
		options: { transforms: { spreadRest: false } },
		input: `var max = Math.max( ...values );`,
		output: `var max = Math.max( ...values );`
	},

	{
		description: 'transpiles multiple spread operators in an array',
		input: `var arr = [ ...a, ...b, ...c ];`,
		output: `var arr = a.concat( b, c );`
	},

	{
		description: 'transpiles mixture of spread and non-spread elements',
		input: `var arr = [ ...a, b, ...c, d ];`,
		output: `var arr = a.concat( [b], c, [d] );`
	},

	{
		description: 'transpiles ...arguments',

		input: `
			function foo () {
				var args = [ ...arguments ];
				return args;
			}`,

		output: `
			function foo () {
				var i = arguments.length, argsArray = Array(i);
				while ( i-- ) argsArray[i] = arguments[i];

				var args = [].concat( argsArray );
				return args;
			}` // TODO if this is the only use of argsArray, don't bother concating
	},

	{
		description: 'transpiles ...arguments in middle of array',

		input: `
			function foo () {
				var arr = [ a, ...arguments, b ];
				return arr;
			}`,

		output: `
			function foo () {
				var i = arguments.length, argsArray = Array(i);
				while ( i-- ) argsArray[i] = arguments[i];

				var arr = [ a ].concat( argsArray, [b] );
				return arr;
			}`
	},

	{
		description: 'transpiles multiple spread operators in function call',
		input: `var max = Math.max( ...theseValues, ...thoseValues );`,
		output: `var max = Math.max.apply( Math, theseValues.concat( thoseValues ) );`
	},

	{
		description: 'transpiles mixture of spread and non-spread operators in function call',
		input: `var max = Math.max( ...a, b, ...c, d );`,
		output: `var max = Math.max.apply( Math, a.concat( [b], c, [d] ) );`
	},

	{
		description: 'transpiles ...arguments in function call',

		input: `
			function foo () {
				return Math.max( ...arguments );
			}`,

		output: `
			function foo () {
				return Math.max.apply( Math, arguments );
			}`
	},

	{
		description: 'transpiles ...arguments in middle of function call',

		input: `
			function foo () {
				return Math.max( a, ...arguments, b );
			}`,

		output: `
			function foo () {
				var i = arguments.length, argsArray = Array(i);
				while ( i-- ) argsArray[i] = arguments[i];

				return Math.max.apply( Math, [ a ].concat( argsArray, [b] ) );
			}`
	},

	{
		description: 'transpiles new with spread args',

		input: `
			function Test() {
				this.a = [...arguments];
				console.log(JSON.stringify(this.a));
			}
			var obj = { Test };

			new Test(...[1, 2]);
			new obj.Test(...[1, 2]);
			new (null || obj).Test(...[1, 2]);

			new Test(0, ...[1, 2]);
			new obj.Test(0, ...[1, 2]);
			new (null || obj).Test(0, ...[1, 2]);

			new Test(...[1, 2], ...[3, 4], 5);
			new obj.Test(...[1, 2], ...[3, 4], 5);
			new (null || obj).Test(...[1, 2], ...[3, 4], 5);

			new Test(...[1, 2], new Test(...[7, 8]), ...[3, 4], 5);
			new obj.Test(...[1, 2], new Test(...[7, 8]), ...[3, 4], 5);
			new (null || obj).Test(...[1, 2], new Test(...[7, 8]), ...[3, 4], 5);

			(function () {
				new Test(...arguments);
				new obj.Test(...arguments);
				new (null || obj).Test(...arguments);

				new Test(1, ...arguments);
				new obj.Test(1, ...arguments);
				new (null || obj).Test(1, ...arguments);
			})(7, 8, 9);
		`,
		output: `
			function Test() {
				var i = arguments.length, argsArray = Array(i);
				while ( i-- ) argsArray[i] = arguments[i];

				this.a = [].concat( argsArray );
				console.log(JSON.stringify(this.a));
			}
			var obj = { Test: Test };

			new (Function.prototype.bind.apply( Test, [ null ].concat( [1, 2]) ));
			new (Function.prototype.bind.apply( obj.Test, [ null ].concat( [1, 2]) ));
			new (Function.prototype.bind.apply( (null || obj).Test, [ null ].concat( [1, 2]) ));

			new (Function.prototype.bind.apply( Test, [ null ].concat( [0], [1, 2]) ));
			new (Function.prototype.bind.apply( obj.Test, [ null ].concat( [0], [1, 2]) ));
			new (Function.prototype.bind.apply( (null || obj).Test, [ null ].concat( [0], [1, 2]) ));

			new (Function.prototype.bind.apply( Test, [ null ].concat( [1, 2], [3, 4], [5]) ));
			new (Function.prototype.bind.apply( obj.Test, [ null ].concat( [1, 2], [3, 4], [5]) ));
			new (Function.prototype.bind.apply( (null || obj).Test, [ null ].concat( [1, 2], [3, 4], [5]) ));

			new (Function.prototype.bind.apply( Test, [ null ].concat( [1, 2], [new (Function.prototype.bind.apply( Test, [ null ].concat( [7, 8]) ))], [3, 4], [5]) ));
			new (Function.prototype.bind.apply( obj.Test, [ null ].concat( [1, 2], [new (Function.prototype.bind.apply( Test, [ null ].concat( [7, 8]) ))], [3, 4], [5]) ));
			new (Function.prototype.bind.apply( (null || obj).Test, [ null ].concat( [1, 2], [new (Function.prototype.bind.apply( Test, [ null ].concat( [7, 8]) ))], [3, 4], [5]) ));

			(function () {
				var i = arguments.length, argsArray = Array(i);
				while ( i-- ) argsArray[i] = arguments[i];

				new (Function.prototype.bind.apply( Test, [ null ].concat( argsArray) ));
				new (Function.prototype.bind.apply( obj.Test, [ null ].concat( argsArray) ));
				new (Function.prototype.bind.apply( (null || obj).Test, [ null ].concat( argsArray) ));

				new (Function.prototype.bind.apply( Test, [ null ].concat( [1], argsArray) ));
				new (Function.prototype.bind.apply( obj.Test, [ null ].concat( [1], argsArray) ));
				new (Function.prototype.bind.apply( (null || obj).Test, [ null ].concat( [1], argsArray) ));
			})(7, 8, 9);
		`
	},
];
