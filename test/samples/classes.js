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
		description:
			'transpiles a class declaration without a constructor function',

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
		description: 'no unnecessary deshadowing of method names',

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

			Foo.prototype.bar = function bar ( str ) {
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
			var Foo = /*@__PURE__*/(function (Bar) {
				function Foo () {
					Bar.apply(this, arguments);
				}

				if ( Bar ) Object.setPrototypeOf(Foo, Bar);
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
			var Foo = /*@__PURE__*/(function (Bar) {
				function Foo ( x ) {
					Bar.call( this, x );
					this.y = 'z';
				}

				if ( Bar ) Object.setPrototypeOf(Foo, Bar);
				Foo.prototype = Object.create( Bar && Bar.prototype );
				Foo.prototype.constructor = Foo;

				Foo.prototype.baz = function baz ( a, b, c ) {
					Bar.prototype.baz.call( this, a, b, c );
				};

				return Foo;
			}(Bar));`
	},

	{
		description: 'transpiles a subclass with super calls with spread arguments',

		input: `
			class Foo extends Bar {
				baz ( ...args ) {
					super.baz(...args);
				}
				boz ( x, y, ...z ) {
					super.boz(x, y, ...z);
				}
				fab ( x, ...y ) {
					super.qux(...x, ...y);
				}
				fob ( x, y, ...z ) {
					((x, y, z) => super.qux(x, ...y, ...z))(x, y, z);
				}
			}`,

		output: `
			var Foo = /*@__PURE__*/(function (Bar) {
				function Foo () {
					Bar.apply(this, arguments);
				}

				if ( Bar ) Object.setPrototypeOf(Foo, Bar);
				Foo.prototype = Object.create( Bar && Bar.prototype );
				Foo.prototype.constructor = Foo;

				Foo.prototype.baz = function baz () {
					var args = [], len = arguments.length;
					while ( len-- ) args[ len ] = arguments[ len ];

					Bar.prototype.baz.apply(this, args);
				};
				Foo.prototype.boz = function boz ( x, y ) {
					var z = [], len = arguments.length - 2;
					while ( len-- > 0 ) z[ len ] = arguments[ len + 2 ];

					Bar.prototype.boz.apply(this, [ x, y ].concat( z ));
				};
				Foo.prototype.fab = function fab ( x ) {
					var y = [], len = arguments.length - 1;
					while ( len-- > 0 ) y[ len ] = arguments[ len + 1 ];

					Bar.prototype.qux.apply(this, x.concat( y ));
				};
				Foo.prototype.fob = function fob ( x, y ) {
					var this$1 = this;
					var z = [], len = arguments.length - 2;
					while ( len-- > 0 ) z[ len ] = arguments[ len + 2 ];

					(function (x, y, z) { return Bar.prototype.qux.apply(this$1, [ x ].concat( y, z )); })(x, y, z);
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
			var Foo = /*@__PURE__*/(function (Bar) {
				function Foo () {
					Bar.apply(this, arguments);
				}

				if ( Bar ) Object.setPrototypeOf(Foo, Bar);
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
			var Foo = /*@__PURE__*/(function (Bar) {
				function Foo () {
					Bar.apply(this, arguments);
				}

				if ( Bar ) Object.setPrototypeOf(Foo, Bar);
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
			var Foo = /*@__PURE__*/(function () {
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
			var Foo = /*@__PURE__*/(function () {
				function Foo ( x ) {
					this.x = x;
				}

				return Foo;
			}());`
	},

	{
		description:
			'transpiles an anonymous class expression with a non-constructor method',

		input: `
			var Foo = class {
				bar ( x ) {
					console.log( x );
				}
			};`,

		output: `
			var Foo = /*@__PURE__*/(function () {
				function Foo () {}

				Foo.prototype.bar = function bar ( x ) {
					console.log( x );
				};

				return Foo;
			}());`
	},

	{
		description:
			'transpiles an anonymous class expression that is assigned to a property',

		input: `
			const q = {};

			q.a = class {
				c () {}
			};`,

		output: `
			var q = {};

			q.a = /*@__PURE__*/(function () {
				function a () {}

				a.prototype.c = function c () {};

				return a;
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

			var prototypeAccessors = { area: { configurable: true } };
			var staticAccessors = { description: { configurable: true } };

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
			var Circle = /*@__PURE__*/(function (Shape) {
				function Circle ( radius ) {
					Shape.call(this);
					this.radius = radius;
				}

				if ( Shape ) Object.setPrototypeOf(Circle, Shape);
				Circle.prototype = Object.create( Shape && Shape.prototype );
				Circle.prototype.constructor = Circle;

				var prototypeAccessors = { area: { configurable: true } };
				var staticAccessors = { description: { configurable: true } };

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
			var q = {a: /*@__PURE__*/(function () {
				function anonymous () {}

				return anonymous;
			}())};

			var b = /*@__PURE__*/(function (superclass) {
				function b () {
					superclass.apply(this, arguments);
				}

				if ( superclass ) Object.setPrototypeOf(b, superclass);
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
			var q = {a: /*@__PURE__*/(function () {
				function anonymous () {}

				return anonymous;
			}())};

			var b = /*@__PURE__*/(function (superclass) {
				function b () {
					superclass.apply(this, arguments);
				}

				if ( superclass ) Object.setPrototypeOf(b, superclass);
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
			var b = /*@__PURE__*/(function (superclass) {
				function b() {
					superclass.call(this);
				}

				if ( superclass ) Object.setPrototypeOf(b, superclass);
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
			SubClass = /*@__PURE__*/(function (SuperClass) {
				function SubClass() {
					SuperClass.call(this);
				}

				if ( SuperClass ) Object.setPrototypeOf(SubClass, SuperClass);
				SubClass.prototype = Object.create( SuperClass && SuperClass.prototype );
				SubClass.prototype.constructor = SubClass;

				return SubClass;
			}(SuperClass));`
	},

	{
		description:
			'verify deindent() does not corrupt string literals in class methods (#159)',

		input: `
			class Foo {
				bar() {
					var s = "0\t1\t\t2\t\t\t3\t\t\t\t4\t\t\t\t\t5";
					return s + '\t';
				}
				baz() {
					return \`\t\`;
				}
			}
		`,
		output: `
			var Foo = function Foo () {};

			Foo.prototype.bar = function bar () {
				var s = "0\t1\t\t2\t\t\t3\t\t\t\t4\t\t\t\t\t5";
				return s + '\t';
			};
			Foo.prototype.baz = function baz () {
				return "\\t";
			};
		`
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
			var Foo = /*@__PURE__*/(function (Bar) {
				function Foo () {
					Bar.apply(this, arguments);
				}

				if ( Bar ) Object.setPrototypeOf(Foo, Bar);
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

			A.prototype.x = function x (){};

			var B = /*@__PURE__*/(function () {
				function B () {}

				B.prototype.x = function x (){};

				return B;
			}());

			var C = /*@__PURE__*/(function (D) {
				function C () {
					D.apply(this, arguments);
				}

				if ( D ) Object.setPrototypeOf(C, D);
				C.prototype = Object.create( D && D.prototype );
				C.prototype.constructor = C;

				C.prototype.x = function x (){};

				return C;
			}(D));

			var E = /*@__PURE__*/(function (F) {
				function E () {
					F.apply(this, arguments);
				}

				if ( F ) Object.setPrototypeOf(E, F);
				E.prototype = Object.create( F && F.prototype );
				E.prototype.constructor = E;

				E.prototype.x = function x (){};

				return E;
			}(F))`
	},

	{
		description: 'transpiles a class with an accessor and no constructor (#48)',

		input: `
			class Foo {
				static get bar() { return 'baz' }
			}`,

		output: `
			var Foo = function Foo () {};

			var staticAccessors = { bar: { configurable: true } };

			staticAccessors.bar.get = function () { return 'baz' };

			Object.defineProperties( Foo, staticAccessors );`
	},

	{
		description:
			'uses correct indentation for inserted statements in constructor (#39)',

		input: `
			class Foo {
				constructor ( options, { a2, b2 } ) {
					const { a, b } = options;

					const render = () => {
						requestAnimationFrame( render );
						this.render();
					};

					render();
				}

				render () {
					// code goes here...
				}
			}`,

		output: `
			var Foo = function Foo ( options, ref ) {
				var this$1 = this;
				var a2 = ref.a2;
				var b2 = ref.b2;

				var a = options.a;
				var b = options.b;

				var render = function () {
					requestAnimationFrame( render );
					this$1.render();
				};

				render();
			};

			Foo.prototype.render = function render () {
				// code goes here...
			};`
	},

	{
		description:
			'uses correct indentation for inserted statements in subclass constructor (#39)',

		input: `
			class Foo extends Bar {
				constructor ( options, { a2, b2 } ) {
					super();

					const { a, b } = options;

					const render = () => {
						requestAnimationFrame( render );
						this.render();
					};

					render();
				}

				render () {
					// code goes here...
				}
			}`,

		output: `
			var Foo = /*@__PURE__*/(function (Bar) {
				function Foo ( options, ref ) {
					var this$1 = this;
					var a2 = ref.a2;
					var b2 = ref.b2;

					Bar.call(this);

					var a = options.a;
					var b = options.b;

					var render = function () {
						requestAnimationFrame( render );
						this$1.render();
					};

					render();
				}

				if ( Bar ) Object.setPrototypeOf(Foo, Bar);
				Foo.prototype = Object.create( Bar && Bar.prototype );
				Foo.prototype.constructor = Foo;

				Foo.prototype.render = function render () {
					// code goes here...
				};

				return Foo;
			}(Bar));`
	},

	{
		description: 'allows subclass to use rest parameters',

		input: `
			class SubClass extends SuperClass {
				constructor( ...args ) {
					super( ...args );
				}
			}`,

		output: `
			var SubClass = /*@__PURE__*/(function (SuperClass) {
				function SubClass() {
					var args = [], len = arguments.length;
					while ( len-- ) args[ len ] = arguments[ len ];

					SuperClass.apply( this, args );
				}

				if ( SuperClass ) Object.setPrototypeOf(SubClass, SuperClass);
				SubClass.prototype = Object.create( SuperClass && SuperClass.prototype );
				SubClass.prototype.constructor = SubClass;

				return SubClass;
			}(SuperClass));`
	},

	{
		description: 'allows subclass to use rest parameters with other arguments',

		input: `
			class SubClass extends SuperClass {
				constructor( ...args ) {
					super( 1, ...args, 2 );
				}
			}`,

		output: `
			var SubClass = /*@__PURE__*/(function (SuperClass) {
				function SubClass() {
					var args = [], len = arguments.length;
					while ( len-- ) args[ len ] = arguments[ len ];

					SuperClass.apply( this, [ 1 ].concat( args, [2] ) );
				}

				if ( SuperClass ) Object.setPrototypeOf(SubClass, SuperClass);
				SubClass.prototype = Object.create( SuperClass && SuperClass.prototype );
				SubClass.prototype.constructor = SubClass;

				return SubClass;
			}(SuperClass));`
	},

	{
		description: 'transpiles computed class properties',

		input: `
			class Foo {
				[a.b.c] () {
					// code goes here
				}
			}`,

		output: `
			var Foo = function Foo () {};

			Foo.prototype[a.b.c] = function () {
				// code goes here
			};`
	},

	{
		description: 'transpiles static computed class properties',

		input: `
			class Foo {
				static [a.b.c] () {
					// code goes here
				}
			}`,

		output: `
			var Foo = function Foo () {};

			Foo[a.b.c] = function () {
				// code goes here
			};`
	},

	{
		skip: true,
		description: 'transpiles computed class accessors',

		input: `
			class Foo {
				get [a.b.c] () {
					// code goes here
				}
			}`,

		output: `
			var Foo = function Foo () {};

			var prototypeAccessors = {};
			var ref = a.b.c;
			prototypeAccessors[ref] = {};

			prototypeAccessors[ref].get = function () {
				// code goes here
			};

			Object.defineProperties( Foo.prototype, prototypeAccessors );`
	},

	{
		description: 'transpiles reserved class properties (!68)',

		input: `
			class Foo {
				catch () {
					// code goes here
				}
			}`,

		output: `
			var Foo = function Foo () {};

			Foo.prototype.catch = function catch$1 () {
				// code goes here
			};`
	},

	{
		description: 'transpiles static reserved class properties (!68)',

		input: `
			class Foo {
				static catch () {
					// code goes here
				}
			}`,

		output: `
			var Foo = function Foo () {};

			Foo.catch = function catch$1 () {
				// code goes here
			};`
	},

	{
		description: 'uses correct `this` when transpiling `super` (#89)',

		input: `
			class A extends B {
				constructor () {
					super();
					this.doSomething(() => {
						super.doSomething();
					});
				}
			}`,

		output: `
			var A = /*@__PURE__*/(function (B) {
				function A () {
					var this$1 = this;

					B.call(this);
					this.doSomething(function () {
						B.prototype.doSomething.call(this$1);
					});
				}

				if ( B ) Object.setPrototypeOf(A, B);
				A.prototype = Object.create( B && B.prototype );
				A.prototype.constructor = A;

				return A;
			}(B));`
	},

	{
		description: 'methods with computed names',

		input: `
			class A {
				[x](){}
				[0](){}
				[1 + 2](){}
				[normal + " Method"](){}
			}
		`,
		output: `
			var A = function A () {};

			A.prototype[x] = function (){};
			A.prototype[0] = function (){};
			A.prototype[1 + 2] = function (){};
			A.prototype[normal + " Method"] = function (){};
		`
	},

	{
		description:
			'static methods with computed names with varied spacing (#139)',

		input: `
			class B {
				static[.000004](){}
				static [x](){}
				static  [x-y](){}
				static[\`Static computed \${name}\`](){}
			}
		`,
		output: `
			var B = function B () {};

			B[.000004] = function (){};
			B[x] = function (){};
			B[x-y] = function (){};
			B[("Static computed " + name)] = function (){};
		`
	},

	{
		description: 'methods with numeric or string names (#139)',

		input: `
			class C {
				0(){}
				0b101(){}
				80(){}
				.12e3(){}
				0o753(){}
				12e34(){}
				0xFFFF(){}
				"var"(){}
			}
		`,
		output: `
			var C = function C () {};

			C.prototype[0] = function (){};
			C.prototype[5] = function (){};
			C.prototype[80] = function (){};
			C.prototype[.12e3] = function (){};
			C.prototype[491] = function (){};
			C.prototype[12e34] = function (){};
			C.prototype[0xFFFF] = function (){};
			C.prototype["var"] = function (){};
		`
	},

	{
		description:
			'static methods with numeric or string names with varied spacing (#139)',

		input: `
			class D {
				static .75(){}
				static"Static Method"(){}
				static "foo"(){}
			}
		`,
		output: `
			var D = function D () {};

			D[.75] = function (){};
			D["Static Method"] = function (){};
			D["foo"] = function (){};
		`
	},

	{
		description: "don't shadow variables with function names (#166)",

		input: `
			class X {
				foo() { return foo }
				bar() {}
			}
		`,
		output: `
			var X = function X () {};

			X.prototype.foo = function foo$1 () { return foo };
			X.prototype.bar = function bar () {};
		`
	},

	{
		description: "don't collide with superclass name (#196)",

		input: `
			A = class extends A {}
		`,
		output: `
			A = /*@__PURE__*/(function (A$1) {
				function A () {
					A$1.apply(this, arguments);
				}if ( A$1 ) Object.setPrototypeOf(A, A$1);
				A.prototype = Object.create( A$1 && A$1.prototype );
				A.prototype.constructor = A;

				

				return A;
			}(A))
		`
	},

	{
		description: "transpiles class with super class in arrow function (#150)",

		input: `
			const f = (b) => class a extends b {};
		`,

		output: `
			var f = function (b) { return /*@__PURE__*/(function (b) {
					function a () {
						b.apply(this, arguments);
					}if ( b ) Object.setPrototypeOf(a, b);
					a.prototype = Object.create( b && b.prototype );
					a.prototype.constructor = a;

					

					return a;
				}(b)); };
		`
	},

	{
		description: "transpiles class extend expression (#251)",

		input: `
			class A extends class B extends class C{c(){}}{b(){}}{a(){}}
		`,
		output: `
			var A = /*@__PURE__*/(function (B) {
				function A () {
					B.apply(this, arguments);
				}

				if ( B ) A.__proto__ = B;
				A.prototype = Object.create( B && B.prototype );
				A.prototype.constructor = A;

				A.prototype.a = function a (){};

				return A;
			}(/*@__PURE__*/(function (C) {
				function B () {
					C.apply(this, arguments);
				}

				if ( C ) B.__proto__ = C;
				B.prototype = Object.create( C && C.prototype );
				B.prototype.constructor = B;

				B.prototype.b = function b (){};

				return B;
			}(/*@__PURE__*/(function () {
				function C () {}

				C.prototype.c = function c (){};

				return C;
			}())))));
		`
	}

	// TODO more tests. e.g. getters and setters.
	// 'super.*' is not allowed before super()
];
