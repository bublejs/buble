module.exports = [
	{
		description: 'transpiles an arrow function',
		input: `var answer = () => 42`,
		output: `var answer = function () { return 42; }`
	},

	{
		description: 'transpiles an arrow function with a naked parameter',
		input: `var double = x => x * 2`,
		output: `var double = function ( x ) { return x * 2; }`
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
	}
];
