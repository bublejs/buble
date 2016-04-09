var assert = require( 'assert' );
var buble = require( '../dist/buble.umd.js' );

require( 'source-map-support' ).install();

describe( 'buble', () => {
	describe( 'arrow functions', () => {
		it( 'transpiles an arrow function', () => {
			var source = `var answer = () => 42`;
			var result = buble.transform( source ).code;

			assert.equal( result, `var answer = function () { return 42; }` );
		});

		it( 'transpiles an arrow function with a naked parameter', () => {
			var source = `var double = x => x * 2`;
			var result = buble.transform( source ).code;

			assert.equal( result, `var double = function ( x ) { return x * 2; }` );
		});

		it( 'transpiles an arrow function with parenthesised parameters', () => {
			var source = `var add = ( a, b ) => a + b`;
			var result = buble.transform( source ).code;

			assert.equal( result, `var add = function ( a, b ) { return a + b; }` );
		});

		it( 'transpiles an arrow function with a body', () => {
			var source = `
				var add = ( a, b ) => {
					return a + b;
				};`;

			var result = buble.transform( source ).code;

			assert.equal( result, `
				var add = function ( a, b ) {
					return a + b;
				};` );
		});

		it( 'replaces `this` inside an arrow function', () => {
			var source = `
				this.foo = 'bar';
				var lexicallyScoped = () => this.foo;`;

			var result = buble.transform( source ).code;

			assert.equal( result, `
				var this$1 = this;

				this.foo = 'bar';
				var lexicallyScoped = function () { return this$1.foo; };` );
		});

		it( 'replaces `arguments` inside an arrow function', () => {
			var source = `
				function firstArgument () {
					return () => arguments[0];
				}
				assert.equal( firstArgument( 1, 2, 3 )(), 1 )`;

			var result = buble.transform( source ).code;

			assert.equal( result, `
				function firstArgument () {
					var arguments$1 = arguments;

					return function () { return arguments$1[0]; };
				}
				assert.equal( firstArgument( 1, 2, 3 )(), 1 )` );
		});

		it( 'only adds one `this` or `arguments` per context', () => {
			var source = `
				function multiply () {
					return () => {
						return () => this * arguments[0];
					};
				}
				assert.equal( multiply.call( 2, 3 )()(), 6 )`;

			var result = buble.transform( source ).code;

			assert.equal( result, `
				function multiply () {
					var arguments$1 = arguments;
					var this$1 = this;

					return function () {
						return function () { return this$1 * arguments$1[0]; };
					};
				}
				assert.equal( multiply.call( 2, 3 )()(), 6 )` );
		});
	});

	describe( 'object properties', () => {
		it( 'transpiles shorthand properties', () => {
			var source = `obj = { x, y }`;
			var result = buble.transform( source ).code;

			assert.equal( result, `obj = { x: x, y: y }` );
		});

		it( 'transpiles shorthand methods', () => {
			var source = `obj = {
				foo () { return 42; }
			}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `obj = {
				foo: function () { return 42; }
			}` );
		});

		it( 'does not transpile computed properties', () => {
			assert.throws( () => {
				buble.transform( `obj = {
					[x]: 'x'
				}` );
			}, /Computed properties are not supported/ );
		});
	});

	describe( 'template strings', () => {
		it( 'transpiles an untagged template literal', () => {
			var source = 'var str = `foo${bar}baz`;';
			var result = buble.transform( source ).code;

			assert.equal( result, `var str = "foo" + bar + "baz";` );
		});

		it( 'handles arbitrary whitespace inside template elements', () => {
			var source = 'var str = `foo${ bar }baz`;';
			var result = buble.transform( source ).code;

			assert.equal( result, `var str = "foo" + bar + "baz";` );
		});

		it( 'transpiles an untagged template literal containing complex expressions', () => {
			var source = 'var str = `foo${bar + baz}qux`;';
			var result = buble.transform( source ).code;

			assert.equal( result, `var str = "foo" + (bar + baz) + "qux";` );
		});

		it( 'transpiles a template literal containing single quotes', () => {
			var source = "var singleQuote = `'`;";
			var result = buble.transform( source ).code;

			assert.equal( result, `var singleQuote = "'";` );
		});

		it( 'transpiles a template literal containing double quotes', () => {
			var source = 'var doubleQuote = `"`;';
			var result = buble.transform( source ).code;

			assert.equal( result, `var doubleQuote = "\\"";` );
		});

		it( 'does not transpile tagged template literals', () => {
			assert.throws( () => {
				buble.transform( 'var str = x`y`' );
			}, /Tagged template expressions are not supported/ );
		});
	});

	describe( 'block scoping', () => {
		it( 'transpiles let', () => {
			var source = `let x = 'y';`;
			var result = buble.transform( source ).code;

			assert.equal( result, `var x = 'y';` );
		});

		it( 'deconflicts blocks in top-level scope', () => {
			var source = `
				if ( a ) {
					let x = 1;
					console.log( x );
				} else if ( b ) {
					let x = 2;
					console.log( x );
				} else {
					let x = 3;
					console.log( x );
				}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				if ( a ) {
					var x = 1;
					console.log( x );
				} else if ( b ) {
					var x$1 = 2;
					console.log( x$1 );
				} else {
					var x$2 = 3;
					console.log( x$2 );
				}` );
		});

		it( 'deconflicts blocks in same function scope', () => {
			var source = `
				var x = 'y';
				function foo () {
					if ( a ) {
						let x = 1;
						console.log( x );
					} else if ( b ) {
						let x = 2;
						console.log( x );
					} else {
						let x = 3;
						console.log( x );
					}
				}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				var x = 'y';
				function foo () {
					if ( a ) {
						var x = 1;
						console.log( x );
					} else if ( b ) {
						var x$1 = 2;
						console.log( x$1 );
					} else {
						var x$2 = 3;
						console.log( x$2 );
					}
				}` );
		});

		it( 'transpiles block scoping inside loops with function bodies', () => {
			var source = `
				function log ( square ) {
					console.log( square );
				}

				for ( let i = 0; i < 10; i += 1 ) {
					const square = i * i;
					setTimeout( function () {
						log( square );
					}, i * 100 );
				}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				function log ( square ) {
					console.log( square );
				}

				var forLoop = function ( i ) {
					var square = i * i;
					setTimeout( function () {
						log( square );
					}, i * 100 );
				};

				for ( var i = 0; i < 10; i += 1 ) forLoop( i );` );
		});

		it( 'transpiles block-less for loops with block-scoped declarations inside function body', () => {
			var source = `
				for ( let i = 0; i < 10; i += 1 ) setTimeout( () => console.log( i ), i * 100 );`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				var forLoop = function ( i ) {
					setTimeout( function () { return console.log( i ); }, i * 100 );
				};

				for ( var i = 0; i < 10; i += 1 ) forLoop( i );` );
		});

		it( 'transpiles block scoping inside loops without function bodies', () => {
			var source = `
				for ( let i = 0; i < 10; i += 1 ) {
					const square = i * i;
					console.log( square );
				}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				for ( var i = 0; i < 10; i += 1 ) {
					var square = i * i;
					console.log( square );
				}` );
		});

		it( 'transpiles block-less for loops without block-scoped declarations inside function body', () => {
			var source = `
				for ( let i = 0; i < 10; i += 1 ) console.log( i );`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				for ( var i = 0; i < 10; i += 1 ) console.log( i );` );
		});

		it( 'disallows duplicate declarations', () => {
			assert.throws( () => {
				buble.transform( `
					let x = 1;
					let x = 2;
				` );
			}, /x is already declared/ );
		});

		it( 'disallows reassignment to constants', () => {
			assert.throws( () => {
				buble.transform( `
					const x = 1;
					x = 2;
				` );
			}, /x is read-only/ );
		});

		it( 'disallows updates to constants', () => {
			assert.throws( () => {
				buble.transform( `
					const x = 1;
					x++;
				` );
			}, /x is read-only/ );
		});

		it( 'does not rewrite properties', () => {
			var source = `
				var foo = 'x';
				if ( true ) {
					let foo = 'y';
					this.foo = 'z';
					this[ foo ] = 'q';
				}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				var foo = 'x';
				if ( true ) {
					var foo$1 = 'y';
					this.foo = 'z';
					this[ foo$1 ] = 'q';
				}` );
		});

		it( 'deconflicts with default imports', () => {
			var source = `
				import foo from './foo.js';

				if ( x ) {
					let foo = 'y';
					console.log( foo );
				}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				import foo from './foo.js';

				if ( x ) {
					var foo$1 = 'y';
					console.log( foo$1 );
				}` );
		});

		it( 'deconflicts with named imports', () => {
			var source = `
				import { foo } from './foo.js';

				if ( x ) {
					let foo = 'y';
					console.log( foo );
				}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				import { foo } from './foo.js';

				if ( x ) {
					var foo$1 = 'y';
					console.log( foo$1 );
				}` );
		});

		it( 'deconflicts with function declarations', () => {
			var source = `
				function foo () {}

				if ( x ) {
					let foo = 'y';
					console.log( foo );
				}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				function foo () {}

				if ( x ) {
					var foo$1 = 'y';
					console.log( foo$1 );
				}` );
		});

		it( 'does not deconflict with function expressions', () => {
			var source = `
				var bar = function foo () {};

				if ( x ) {
					let foo = 'y';
					console.log( foo );
				}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				var bar = function foo () {};

				if ( x ) {
					var foo = 'y';
					console.log( foo );
				}` );
		});

		it( 'deconflicts with class declarations', () => {
			var source = `
				class foo {}

				if ( x ) {
					let foo = 'y';
					console.log( foo );
				}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				var foo = function foo () {};

				if ( x ) {
					var foo$1 = 'y';
					console.log( foo$1 );
				}` );
		});

		it( 'does not deconflict with class expressions', () => {
			var source = `
				var bar = class foo {};

				if ( x ) {
					let foo = 'y';
					console.log( foo );
				}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				var bar = function foo () {};

				if ( x ) {
					var foo = 'y';
					console.log( foo );
				}` );
		});
	});

	describe( 'classes', () => {
		it( 'transpiles a class declaration', () => {
			var source = `
				class Foo {
					constructor ( answer ) {
						this.answer = answer;
					}
				}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				var Foo = function Foo ( answer ) {
					this.answer = answer;
				};` );
		});

		it( 'transpiles a class declaration with a non-constructor method', () => {
			var source = `
				class Foo {
					constructor ( answer ) {
						this.answer = answer;
					}

					bar ( str ) {
						return str + 'bar';
					}
				}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				var Foo = function Foo ( answer ) {
					this.answer = answer;
				};

				Foo.prototype.bar = function bar ( str ) {
					return str + 'bar';
				};` );
		});

		it( 'transpiles a class declaration without a constructor function', () => {
			var source = `
				class Foo {
					bar ( str ) {
						return str + 'bar';
					}
				}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				var Foo = function Foo () {};

				Foo.prototype.bar = function bar ( str ) {
					return str + 'bar';
				};` );
		});

		it( 'deshadows method names', () => {
			var source = `
				var bar = 'x';

				class Foo {
					bar ( str ) {
						return str + 'bar';
					}
				}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				var bar = 'x';

				var Foo = function Foo () {};

				Foo.prototype.bar = function bar$1 ( str ) {
					return str + 'bar';
				};` );
		});

		it( 'transpiles a class declaration with a static method', () => {
			var source = `
				class Foo {
					bar ( str ) {
						return str + 'bar';
					}

					static baz ( str ) {
						return str + 'baz';
					}
				}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				var Foo = function Foo () {};

				Foo.prototype.bar = function bar ( str ) {
					return str + 'bar';
				};

				Foo.baz = function baz ( str ) {
					return str + 'baz';
				};` );
		});

		it( 'transpiles a subclass', () => {
			var source = `
				class Foo extends Bar {
					baz ( str ) {
						return str + 'baz';
					}
				}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
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
				}(Bar));` );
		});

		it( 'transpiles a subclass with super calls', function () {
			var source = `
				class Foo extends Bar {
					constructor ( x ) {
						super( x );
						this.y = 'z';
					}

					baz ( a, b, c ) {
						super.baz( a, b, c );
					}
				}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
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
				}(Bar));` );
		});

		it( 'transpiles export default class', function () {
			var source = `
				export default class Foo {
					bar () {}
				}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				var Foo = function Foo () {};

				Foo.prototype.bar = function bar () {};

				export default Foo;` );
		});

		it( 'transpiles empty class', function () {
			var source = `class Foo {}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `var Foo = function Foo () {};` );
		});

		// TODO more tests. e.g. getters and setters. computed method names
		// 'super.*' is not allowed before super()
	});

	describe( 'destructuring', () => {
		it( 'destructures an identifier with an object pattern', () => {
			var source = `var { x, y } = point;`;
			var result = buble.transform( source ).code;

			assert.equal( result, `var x = point.x, y = point.y;` );
		});

		it( 'destructures a non-identifier with an object pattern', () => {
			var source = `var { x, y } = getPoint();`;
			var result = buble.transform( source ).code;

			assert.equal( result, `var ref = getPoint(), x = ref.x, y = ref.y;` );
		});

		it( 'destructures a parameter with an object pattern', () => {
			var source = `
				function pythag ( { x, y: z = 1 } ) {
					return Math.sqrt( x * x + z * z );
				}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				function pythag ( ref ) {
					var x = ref.x;
					var ref_y = ref.y, z = ref_y === void 0 ? 1 : ref_y;

					return Math.sqrt( x * x + z * z );
				}` );
		});

		it( 'destructures an identifier with an array pattern', () => {
			var source = `var [ x, y ] = point;`;
			var result = buble.transform( source ).code;

			assert.equal( result, `var x = point[0], y = point[1];` );
		});

		it( 'destructures a non-identifier with an array pattern', () => {
			var source = `var [ x, y ] = getPoint();`;
			var result = buble.transform( source ).code;

			assert.equal( result, `var ref = getPoint(), x = ref[0], y = ref[1];` );
		});

		it( 'destructures a parameter with an object pattern', () => {
			var source = `
				function pythag ( [ x, z = 1 ] ) {
					return Math.sqrt( x * x + z * z );
				}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				function pythag ( ref ) {
					var x = ref[0];
					var ref_1 = ref[1], z = ref_1 === void 0 ? 1 : ref_1;

					return Math.sqrt( x * x + z * z );
				}` );
		});

		it( 'disallows compound destructuring', () => {
			assert.throws( () => {
				buble.transform( `var { a: { b: c } } = d;` );
			}, /Compound destructuring is not supported/ );
		});
	});

	describe( 'default parameters', () => {
		it( 'transpiles default parameters', () => {
			var source = `
				function foo ( a = 1, b = 2 ) {
					console.log( a, b );
				}

				var bar = function ( a = 1, b = 2 ) {
					console.log( a, b );
				};`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				function foo ( a, b ) {
					if ( a === void 0 ) a = 1;
					if ( b === void 0 ) b = 2;

					console.log( a, b );
				}

				var bar = function ( a, b ) {
					if ( a === void 0 ) a = 1;
					if ( b === void 0 ) b = 2;

					console.log( a, b );
				};` );
		});
	});

	describe( 'rest parameters', () => {
		it( 'transpiles solo rest parameters', () => {
			var source = `
				function foo ( ...theRest ) {
					console.log( theRest );
				}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				function foo () {
					var theRest = [], len = arguments.length;
					while ( len-- ) theRest[ len ] = arguments[ len ];

					console.log( theRest );
				}` );
		});

		it( 'transpiles rest parameters following other parameters', () => {
			var source = `
				function foo ( a, b, c, ...theRest ) {
					console.log( theRest );
				}`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				function foo ( a, b, c ) {
					var theRest = [], len = arguments.length - 3;
					while ( len-- > 0 ) theRest[ len ] = arguments[ len + 3 ];

					console.log( theRest );
				}` );
		});
	});

	describe( 'binary and octal', () => {
		it( 'transpiles binary numbers', () => {
			var source = `
				var num = 0b111110111;
				var str = '0b111110111';`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				var num = 503;
				var str = '0b111110111';` );
		});

		it( 'transpiles octal numbers', () => {
			var source = `
				var num = 0o767;
				var str = '0o767';`;
			var result = buble.transform( source ).code;

			assert.equal( result, `
				var num = 503;
				var str = '0o767';` );
		});
	});
});
