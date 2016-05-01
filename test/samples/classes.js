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
		options: { transforms: { moduleExport: false } },

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
	},

	{
		description: 'transpiles getters and setters',

		input: `
			class Circle {
				constructor ( radius ) {
					this.radius = radius;
				}

				get area () {
					return Math.PI * Math.pow( this.radius, 2 );
				}

				set area ( area ) {
					this.radius = Math.sqrt( area / Math.PI );
				}
			}`,

		output: `
			var Circle = function Circle ( radius ) {
				this.radius = radius;
			};

			var accessors = { area: {} };

			accessors.area.get = function () {
				return Math.PI * Math.pow( this.radius, 2 );
			};

			accessors.area.set = function ( area ) {
				this.radius = Math.sqrt( area / Math.PI );
			};

			Object.defineProperties( Circle.prototype, accessors );`
	},

	{
		description: 'transpiles getters and setters in subclass',

		input: `
			class Circle extends Shape {
				constructor ( radius ) {
					super();
					this.radius = radius;
				}

				get area () {
					return Math.PI * Math.pow( this.radius, 2 );
				}

				set area ( area ) {
					this.radius = Math.sqrt( area / Math.PI );
				}
			}`,

		output: `
			var Circle = (function (Shape) {
				function Circle ( radius ) {
					Shape.call(this);
					this.radius = radius;
				}

				Circle.prototype = Object.create( Shape && Shape.prototype );
				Circle.prototype.constructor = Circle;

				var accessors = { area: {} };

				accessors.area.get = function () {
					return Math.PI * Math.pow( this.radius, 2 );
				};

				accessors.area.set = function ( area ) {
					this.radius = Math.sqrt( area / Math.PI );
				};

				Object.defineProperties( Circle.prototype, accessors );

				return Circle;
			}(Shape));`
	},

	{
		description: 'can be disabled with `transforms.classes: false`',
		options: { transforms: { classes: false } },

		input: `
			class Foo extends Bar {
				constructor ( answer ) {
					super();
					this.answer = answer;
				}
			}`,

		output: `
			class Foo extends Bar {
				constructor ( answer ) {
					super();
					this.answer = answer;
				}
			}`
	},

	{
		description: 'declaration extends from an expression (#15)',

		input: `
			const q = {a: class {}};

			class b extends q.a {
				c () {}
			}`,

		output: `
			var q = {a: (function () {
				function anonymous () {}

				return anonymous;
			}())};

			var b = (function (superclass) {
				function b () {
					superclass.apply(this, arguments);
				}

				b.prototype = Object.create( superclass && superclass.prototype );
				b.prototype.constructor = b;

				b.prototype.c = function c () {};

				return b;
			}(q.a));`
	},

	{
		description: 'expression extends from an expression (#15)',

		input: `
			const q = {a: class {}};

			const b = class b extends q.a {
				c () {}
			};`,

		output: `
			var q = {a: (function () {
				function anonymous () {}

				return anonymous;
			}())};

			var b = (function (superclass) {
				function b () {
					superclass.apply(this, arguments);
				}

				b.prototype = Object.create( superclass && superclass.prototype );
				b.prototype.constructor = b;

				b.prototype.c = function c () {};

				return b;
			}(q.a));`
	},

	{
		description: 'expression extends from an expression with super calls (#31)',

		input: `
			class b extends x.y.z {
				constructor() {
					super();
				}
			}`,

		output: `
			var b = (function (superclass) {
				function b() {
					superclass.call(this);
				}

				b.prototype = Object.create( superclass && superclass.prototype );
				b.prototype.constructor = b;

				return b;
			}(x.y.z));`
	},

	{
		description: 'deindents a function body with destructuring (#22)',

		input: `
			class Foo {
				constructor ( options ) {
					const {
						a,
						b
					} = options;
				}
			}`,

		output: `
			var Foo = function Foo ( options ) {
				var a = options.a, b = options.b;
			};`
	}

	// TODO more tests. e.g. getters and setters. computed method names
	// 'super.*' is not allowed before super()
];
