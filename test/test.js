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

			assert.equal( result, `var str = 'foo' + bar + 'baz';` );
		});

		it( 'transpiles an untagged template literal containing complex expressions', () => {
			var source = 'var str = `foo${bar + baz}qux`;';
			var result = buble.transform( source ).code;

			assert.equal( result, `var str = 'foo' + (bar + baz) + 'qux';` );
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
				function log(square) {
					console.log(square);
				}

				var forLoop = function ( i ) {
					var square = i * i;
					setTimeout( function () {
						log( square );
					}, i * 100 );
				};

				for ( var i = 0; i < 10; i += 1 ) {
					forLoop( i );
				}` );
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
	});

	describe.only( 'classes', () => {
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
						Bar.call(this);
					}

					Foo.prototype.baz = function baz ( str ) {
						return str + 'baz';
					};

					return Foo;
				}(Bar));` );
		});

		it.only( 'transpiles a subclass with super calls', function () {
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

					Foo.prototype.baz = function baz ( a, b, c ) {
						Bar.prototype.baz.call( this, a, b, c );
					};

					return Foo;
				}(Bar));` );
		});

		// TODO more tests. e.g. getters and setters. computed method names
		// 'super.*' is not allowed before super()
	});

	describe( 'destructuring', () => {
		it( 'destructures an identifier', () => {
			var source = `var { width, height } = point;`;
			var result = buble.transform( source ).code;

			assert.equal( result, `var width = point.width, height = point.height;` );
		});

		it( 'destructures a non-identifier', () => {
			var source = `var { width, height } = getPoint();`;
			var result = buble.transform( source ).code;

			assert.equal( result, `var ref = getPoint(), width = ref.width, height = ref.height;` );
		});

		it( 'disallows compound destructuring', () => {
			assert.throws( () => {
				buble.transform( `var { a: { b: c } } = d;` );
			}, /Compound destructuring is not supported/ );
		});
	});
});
