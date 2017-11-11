module.exports = [
	{
		description: 'transpiles an arrow function',
		input: `var answer = () => 42`,
		output: `var answer = function () { return 42; }`
	},

	{
		description: 'transpiles an arrow function with a naked parameter',
		input: `var double = x => x * 2`,
		output: `var double = function (x) { return x * 2; }`
	},

	{
		description: 'transpiles an arrow function with single wrapped parameter',
		input: `var double = (x) => x * 2`,
		output: `var double = function (x) { return x * 2; }`
	},

	{
		description: 'transpiles an arrow function with parenthesised parameters',
		input: `var add = ( a, b ) => a + b`,
		output: `var add = function ( a, b ) { return a + b; }`
	},

	{
		description: 'transpiles an arrow function with a body',

		input: `
			var add = ( a, b ) => {
				return a + b;
			};`,

		output: `
			var add = function ( a, b ) {
				return a + b;
			};`
	},

	{
		description: 'replaces `this` inside an arrow function',

		input: `
			this.foo = 'bar';
			var lexicallyScoped = () => this.foo;`,

		output: `
			var this$1 = this;

			this.foo = 'bar';
			var lexicallyScoped = function () { return this$1.foo; };`
	},

	{
		description: 'replaces `arguments` inside an arrow function',

		input: `
			function firstArgument () {
				return () => arguments[0];
			}
			equal( firstArgument( 1, 2, 3 )(), 1 )`,

		output: `
			function firstArgument () {
				var arguments$1 = arguments;

				return function () { return arguments$1[0]; };
			}
			equal( firstArgument( 1, 2, 3 )(), 1 )`
	},

	{
		description: 'only adds one `this` or `arguments` per context',

		input: `
			function multiply () {
				return () => {
					return () => this * arguments[0];
				};
			}
			equal( multiply.call( 2, 3 )()(), 6 )`,

		output: `
			function multiply () {
				var arguments$1 = arguments;
				var this$1 = this;

				return function () {
					return function () { return this$1 * arguments$1[0]; };
				};
			}
			equal( multiply.call( 2, 3 )()(), 6 )`
	},

	{
		description: 'transpiles a body-less arrow function with rest params',

		input: `
			const sum = ( ...nums ) => nums.reduce( ( t, n ) => t + n, 0 );`,

		output: `
			var sum = function () {
				var nums = [], len = arguments.length;
				while ( len-- ) nums[ len ] = arguments[ len ];

				return nums.reduce( function ( t, n ) { return t + n; }, 0 );
			};`
	},

	{
		description: 'handles combination of destructuring and template strings',

		input: `
			var shoutHello = ({ name }) => \`\${name}! Hello \${name}!\`.toUpperCase();`,

		output: `
			var shoutHello = function (ref) {
				var name = ref.name;

				return (name + "! Hello " + name + "!").toUpperCase();
			};`
	},

	{
		description: 'can be disabled with `transforms.arrow: false`',
		options: { transforms: { arrow: false } },

		input: `
			var add = ( a, b ) => {
				console.log( 'this, arguments', this, arguments )
				a = b;
			}`,

		output: `
			var add = ( a, b ) => {
				console.log( 'this, arguments', this, arguments )
				a = b;
			}`
	},

	{
		description: 'inserts statements after use strict pragma (#72)',

		input: `
			'use strict';
			setTimeout( () => console.log( this ) );

			function foo () {
				'use strict';
				setTimeout( () => console.log( this ) );
			}`,

		output: `
			'use strict';
			var this$1 = this;

			setTimeout( function () { return console.log( this$1 ); } );

			function foo () {
				'use strict';
				var this$1 = this;

				setTimeout( function () { return console.log( this$1 ); } );
			}`
	},

	{
		description: 'handles standalone arrow function expression statement',

		input: `
			() => console.log( 'not printed' );`,

		output: `
			!function() { return console.log( 'not printed' ); };`
	},

	{
		description:
			'handles standalone arrow function expression statement within a function',

		input: `
			function no_op () {
				() => console.log( 'not printed' );
			}`,

		output: `
			function no_op () {
				!function() { return console.log( 'not printed' ); };
			}`
	},

	{
		description:
			'are transformed even if disabled if they have a transpiled spread parameter',

		options: { transforms: { arrow: false, spreadRest: true } },

		input: `
				(...args) => console.log( args );`,

		output: `
				!function() {
					var args = [], len = arguments.length;
					while ( len-- ) args[ len ] = arguments[ len ];

					return console.log( args );
				};`
	}
];
