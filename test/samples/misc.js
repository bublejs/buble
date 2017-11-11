module.exports = [
	{
		description: 'handles empty return',
		input: `
			function foo () {
				return;
			}`,
		output: `
			function foo () {
				return;
			}`
	},

	{
		description: 'allows break statement inside switch',

		input: `
			switch ( foo ) {
				case bar:
				console.log( 'bar' );
				break;

				default:
				console.log( 'default' );
			}`,

		output: `
			switch ( foo ) {
				case bar:
				console.log( 'bar' );
				break;

				default:
				console.log( 'default' );
			}`
	},

	{
		description: 'double var is okay',

		input: `
			function foo () {
				var x = 1;
				var x = 2;
			}`,

		output: `
			function foo () {
				var x = 1;
				var x = 2;
			}`
	},

	{
		description: 'var followed by let is not okay',

		input: `
			function foo () {
				var x = 1;
				let x = 2;
			}`,

		error: /Identifier 'x' has already been declared/
	},

	{
		description: 'let followed by var is not okay',

		input: `
			function foo () {
				let x = 1;
				var x = 2;
			}`,

		error: /Identifier 'x' has already been declared/
	},

	{
		description: 'does not get confused about keys of Literal node',

		input: `
			console.log( null );
			console.log( 'some string' );
			console.log( null );`,

		output: `
			console.log( null );
			console.log( 'some string' );
			console.log( null );`
	},

	{
		description: 'handles sparse arrays (#62)',
		input: `var a = [ , 1 ], b = [ 1, ], c = [ 1, , 2 ], d = [ 1, , , ];`,
		output: `var a = [ , 1 ], b = [ 1 ], c = [ 1, , 2 ], d = [ 1, , , ];`
	},

	{
		description:
			'Safari/WebKit bug workaround: parameter shadowing function expression name (#154)',

		input: `
			"use strict"; // necessary to trigger WebKit bug

			class Foo {
				bar (bar) {
					return bar;
				}
				static baz (foo, bar, baz) {
					return foo * baz - baz * bar;
				}
			}

			var a = class Bar {
				b (a, b, c) {
					return a * b - c * b + b$1 - b$2;
				}
			};

			var b = class {
				b (a, b, c) {
					return a * b - c * b;
				}
			};

			var c = {
				b (a, b, c) {
					return a * b - c * b;
				}
			};

			var d = function foo(foo) {
				return foo;
			};

			// FunctionDeclaration is not subject to the WebKit bug
			function bar(bar) {
				return bar;
			}
		`,
		output: `
			"use strict"; // necessary to trigger WebKit bug

			var Foo = function Foo () {};

			Foo.prototype.bar = function bar (bar$1) {
				return bar$1;
			};
			Foo.baz = function baz (foo, bar, baz$1) {
				return foo * baz$1 - baz$1 * bar;
			};

			var a = (function () {
				function Bar () {}

				Bar.prototype.b = function b (a, b$3, c) {
					return a * b$3 - c * b$3 + b$1 - b$2;
				};

				return Bar;
			}());

			var b = (function () {
				function b () {}

				b.prototype.b = function b (a, b$1, c) {
					return a * b$1 - c * b$1;
				};

				return b;
			}());

			var c = {
				b: function b (a, b$1, c) {
					return a * b$1 - c * b$1;
				}
			};

			var d = function foo(foo$1) {
				return foo$1;
			};

			// FunctionDeclaration is not subject to the WebKit bug
			function bar(bar) {
				return bar;
			}
		`
	}
];
