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

				if ( Bar ) Foo.__proto__ = Bar;
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

				if ( Bar ) Foo.__proto__ = Bar;
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
		description: 'transpiles export default subclass',
		options: { transforms: { moduleExport: false } },

		input: `
			export default class Foo extends Bar {
				bar () {}
			}`,

		output: `
			var Foo = (function (Bar) {
				function Foo () {
					Bar.apply(this, arguments);
				}

				if ( Bar ) Foo.__proto__ = Bar;
				Foo.prototype = Object.create( Bar && Bar.prototype );
				Foo.prototype.constructor = Foo;

				Foo.prototype.bar = function bar () {};

				return Foo;
			}(Bar));

			export default Foo;`
	},

	{
		description: 'transpiles export default subclass with subsequent statement',
		options: { transforms: { moduleExport: false } },

		input: `
			export default class Foo extends Bar {
				bar () {}
			}

			new Foo().bar();`,

		output: `
			var Foo = (function (Bar) {
				function Foo () {
					Bar.apply(this, arguments);
				}

				if ( Bar ) Foo.__proto__ = Bar;
				Foo.prototype = Object.create( Bar && Bar.prototype );
				Foo.prototype.constructor = Foo;

				Foo.prototype.bar = function bar () {};

				return Foo;
			}(Bar));

			export default Foo;

			new Foo().bar();`
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

				static get description () {
					return 'round';
				}
			}`,

		output: `
			var Circle = function Circle ( radius ) {
				this.radius = radius;
			};

			var prototypeAccessors = { area: {} };
			var staticAccessors = { description: {} };

			prototypeAccessors.area.get = function () {
				return Math.PI * Math.pow( this.radius, 2 );
			};

			prototypeAccessors.area.set = function ( area ) {
				this.radius = Math.sqrt( area / Math.PI );
			};

			staticAccessors.description.get = function () {
				return 'round';
			};

			Object.defineProperties( Circle.prototype, prototypeAccessors );
			Object.defineProperties( Circle, staticAccessors );`
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

				static get description () {
					return 'round';
				}
			}`,

		output: `
			var Circle = (function (Shape) {
				function Circle ( radius ) {
					Shape.call(this);
					this.radius = radius;
				}

				if ( Shape ) Circle.__proto__ = Shape;
				Circle.prototype = Object.create( Shape && Shape.prototype );
				Circle.prototype.constructor = Circle;

				var prototypeAccessors = { area: {} };
				var staticAccessors = { description: {} };

				prototypeAccessors.area.get = function () {
					return Math.PI * Math.pow( this.radius, 2 );
				};

				prototypeAccessors.area.set = function ( area ) {
					this.radius = Math.sqrt( area / Math.PI );
				};

				staticAccessors.description.get = function () {
					return 'round';
				};

				Object.defineProperties( Circle.prototype, prototypeAccessors );
				Object.defineProperties( Circle, staticAccessors );

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

				if ( superclass ) b.__proto__ = superclass;
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

				if ( superclass ) b.__proto__ = superclass;
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

				if ( superclass ) b.__proto__ = superclass;
				b.prototype = Object.create( superclass && superclass.prototype );
				b.prototype.constructor = b;

				return b;
			}(x.y.z));`
	},

	{
		description: 'anonymous expression extends named class (#31)',

		input: `
			SubClass = class extends SuperClass {
				constructor() {
					super();
				}
			};`,

		output: `
			SubClass = (function (SuperClass) {
				function SubClass() {
					SuperClass.call(this);
				}

				if ( SuperClass ) SubClass.__proto__ = SuperClass;
				SubClass.prototype = Object.create( SuperClass && SuperClass.prototype );
				SubClass.prototype.constructor = SubClass;

				return SubClass;
			}(SuperClass));`
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
				var a = options.a;
					var b = options.b;
			};`
	},

	{
		description: 'allows super in static methods',

		input: `
			class Foo extends Bar {
				static baz () {
					super.baz();
				}
			}`,

		output: `
			var Foo = (function (Bar) {
				function Foo () {
					Bar.apply(this, arguments);
				}

				if ( Bar ) Foo.__proto__ = Bar;
				Foo.prototype = Object.create( Bar && Bar.prototype );
				Foo.prototype.constructor = Foo;

				Foo.baz = function baz () {
					Bar.baz.call(this);
				};

				return Foo;
			}(Bar));`
	},

	{
		description: 'allows zero space between class id and body (#46)',

		input: `
			class A{
				x(){}
			}

			var B = class B{
				x(){}
			};

			class C extends D{
				x(){}
			}

			var E = class E extends F{
				x(){}
			}`,

		output: `
			var A = function A () {};

			A.prototype.x = function x(){};

			var B = (function () {
				function B () {}

				B.prototype.x = function x(){};

				return B;
			}());

			var C = (function (D) {
				function C () {
					D.apply(this, arguments);
				}

				if ( D ) C.__proto__ = D;
				C.prototype = Object.create( D && D.prototype );
				C.prototype.constructor = C;

				C.prototype.x = function x(){};

				return C;
			}(D));

			var E = (function (F) {
				function E () {
					F.apply(this, arguments);
				}

				if ( F ) E.__proto__ = F;
				E.prototype = Object.create( F && F.prototype );
				E.prototype.constructor = E;

				E.prototype.x = function x(){};

				return E;
			}(F))`
	}

	// TODO more tests. e.g. getters and setters. computed method names
	// 'super.*' is not allowed before super()
];
