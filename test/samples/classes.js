module.exports = [
	{
		description: 'transpiles a class declaration',

		input: `
			class Foo {
				constructor ( answer ) {
					this.answer = answer;
				}
			}`,

		output: `
			var Foo = function Foo ( answer ) {
				this.answer = answer;
			};`
	},

	{
		description: 'transpiles a class declaration with a non-constructor method',

		input: `
			class Foo {
				constructor ( answer ) {
					this.answer = answer;
				}

				bar ( str ) {
					return str + 'bar';
				}
			}`,

		output: `
			var Foo = function Foo ( answer ) {
				this.answer = answer;
			};

			Foo.prototype.bar = function bar ( str ) {
				return str + 'bar';
			};`
	},

	{
		description: 'transpiles a class declaration without a constructor function',

		input: `
			class Foo {
				bar ( str ) {
					return str + 'bar';
				}
			}`,

		output: `
			var Foo = function Foo () {};

			Foo.prototype.bar = function bar ( str ) {
				return str + 'bar';
			};`
	},

	{
		description: 'deshadows method names',

		input: `
			var bar = 'x';

			class Foo {
				bar ( str ) {
					return str + 'bar';
				}
			}`,

		output: `
			var bar = 'x';

			var Foo = function Foo () {};

			Foo.prototype.bar = function bar$1 ( str ) {
				return str + 'bar';
			};`
	},

	{
		description: 'transpiles a class declaration with a static method',

		input: `
			class Foo {
				bar ( str ) {
					return str + 'bar';
				}

				static baz ( str ) {
					return str + 'baz';
				}
			}`,

		output: `
			var Foo = function Foo () {};

			Foo.prototype.bar = function bar ( str ) {
				return str + 'bar';
			};

			Foo.baz = function baz ( str ) {
				return str + 'baz';
			};`
	},

	{
		description: 'transpiles a subclass',

		input: `
			class Foo extends Bar {
				baz ( str ) {
					return str + 'baz';
				}
			}`,

		output: `
			var Foo = (function (Bar) {
				function Foo () {
					Bar.apply(this, arguments);
				}

				Foo.prototype = Object.create( Bar && Bar.prototype );
				Foo.prototype.constructor = Foo;

				Foo.prototype.baz = function baz ( str ) {
					return str + 'baz';
				};

				return Foo;
			}(Bar));`
	},

	{
		description: 'transpiles a subclass with super calls',

		input: `
			class Foo extends Bar {
				constructor ( x ) {
					super( x );
					this.y = 'z';
				}

				baz ( a, b, c ) {
					super.baz( a, b, c );
				}
			}`,

		output: `
			var Foo = (function (Bar) {
				function Foo ( x ) {
					Bar.call( this, x );
					this.y = 'z';
				}

				Foo.prototype = Object.create( Bar && Bar.prototype );
				Foo.prototype.constructor = Foo;

				Foo.prototype.baz = function baz ( a, b, c ) {
					Bar.prototype.baz.call( this, a, b, c );
				};

				return Foo;
			}(Bar));`
	},

	{
		description: 'transpiles export default class',

		input: `
			export default class Foo {
				bar () {}
			}`,

		output: `
			var Foo = function Foo () {};

			Foo.prototype.bar = function bar () {};

			export default Foo;`
	},

	{
		description: 'transpiles empty class',

		input: `class Foo {}`,
		output: `var Foo = function Foo () {};`
	},

	{
		description: 'transpiles an anonymous empty class expression',

		input: `
			var Foo = class {};`,

		output: `
			var Foo = (function () {
				function Foo () {}

				return Foo;
			}());`
	},

	{
		description: 'transpiles an anonymous class expression with a constructor',

		input: `
			var Foo = class {
				constructor ( x ) {
					this.x = x;
				}
			};`,

		output: `
			var Foo = (function () {
				function Foo ( x ) {
					this.x = x;
				}

				return Foo;
			}());`
	},

	{
		description: 'transpiles an anonymous class expression with a non-constructor method',

		input: `
			var Foo = class {
				bar ( x ) {
					console.log( x );
				}
			};`,

		output: `
			var Foo = (function () {
				function Foo () {}

				Foo.prototype.bar = function bar ( x ) {
					console.log( x );
				};

				return Foo;
			}());`
	},

	{
		description: 'allows constructor to be in middle of body',

		input: `
			class Foo {
				before () {
					// code goes here
				}

				constructor () {
					// constructor goes here
				}

				after () {
					// code goes here
				}
			}`,

		output: `
			var Foo = function Foo () {
				// constructor goes here
			};

			Foo.prototype.before = function before () {
				// code goes here
			};

			Foo.prototype.after = function after () {
				// code goes here
			};`
	},

	{
		description: 'allows constructor to be at end of body',

		input: `
			class Foo {
				before () {
					// code goes here
				}

				constructor () {
					// constructor goes here
				}
			}`,

		output: `
			var Foo = function Foo () {
				// constructor goes here
			};

			Foo.prototype.before = function before () {
				// code goes here
			};`
	}

	// TODO more tests. e.g. getters and setters. computed method names
	// 'super.*' is not allowed before super()
];
