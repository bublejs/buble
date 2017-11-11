module.exports = [
	{
		description: 'transpiles block scoping inside loops with function bodies',

		input: `
			function log ( square ) {
				console.log( square );
			}

			for ( let i = 0; i < 10; i += 1 ) {
				const square = i * i;
				setTimeout( function () {
					log( square );
				}, i * 100 );
			}`,

		output: `
			function log ( square ) {
				console.log( square );
			}

			var loop = function ( i ) {
				var square = i * i;
				setTimeout( function () {
					log( square );
				}, i * 100 );
			};

			for ( var i = 0; i < 10; i += 1 ) loop( i );`
	},

	{
		description:
			'transpiles block scoping inside while loops with function bodies',

		input: `
			function log ( square ) {
				console.log( square );
			}

			while ( i-- ) {
				const square = i * i;
				setTimeout( function () {
					log( square );
				}, i * 100 );
			}`,

		output: `
			function log ( square ) {
				console.log( square );
			}

			var loop = function () {
				var square = i * i;
				setTimeout( function () {
					log( square );
				}, i * 100 );
			};

			while ( i-- ) loop();`
	},

	{
		description:
			'transpiles block scoping inside do-while loops with function bodies',

		input: `
			function log ( square ) {
				console.log( square );
			}

			do {
				const square = i * i;
				setTimeout( function () {
					log( square );
				}, i * 100 );
			} while ( i-- );`,

		output: `
			function log ( square ) {
				console.log( square );
			}

			var loop = function () {
				var square = i * i;
				setTimeout( function () {
					log( square );
				}, i * 100 );
			};

			do {
				loop();
			} while ( i-- );`
	},

	{
		description:
			'transpiles block-less for loops with block-scoped declarations inside function body',

		input: `
			for ( let i = 0; i < 10; i += 1 ) setTimeout( () => console.log( i ), i * 100 );`,

		output: `
			var loop = function ( i ) {
				setTimeout( function () { return console.log( i ); }, i * 100 );
			};

			for ( var i = 0; i < 10; i += 1 ) loop( i );`
	},

	{
		description:
			'transpiles block scoping inside loops without function bodies',

		input: `
			for ( let i = 0; i < 10; i += 1 ) {
				const square = i * i;
				console.log( square );
			}`,

		output: `
			for ( var i = 0; i < 10; i += 1 ) {
				var square = i * i;
				console.log( square );
			}`
	},

	{
		description:
			'transpiles block-less for loops without block-scoped declarations inside function body',

		input: `
			for ( let i = 0; i < 10; i += 1 ) console.log( i );`,

		output: `
			for ( var i = 0; i < 10; i += 1 ) { console.log( i ); }`
	},

	{
		description:
			'preserves correct `this` and `arguments` inside block scoped loop (#10)',

		input: `
			for ( let i = 0; i < 10; i += 1 ) {
				console.log( this, arguments, i );
				setTimeout( function () {
					console.log( this, arguments, i );
				}, i * 100 );
			}`,

		output: `
			var arguments$1 = arguments;
			var this$1 = this;

			var loop = function ( i ) {
				console.log( this$1, arguments$1, i );
				setTimeout( function () {
					console.log( this, arguments, i );
				}, i * 100 );
			};

			for ( var i = 0; i < 10; i += 1 ) loop( i );`
	},

	{
		description:
			'maintains value of for loop variables between iterations (#11)',

		input: `
			var fns = [];

			for ( let i = 0; i < 10; i += 1 ) {
				fns.push(function () { return i; });
				i += 1;
			}`,

		output: `
			var fns = [];

			var loop = function ( i$1 ) {
				fns.push(function () { return i$1; });
				i$1 += 1;

				i = i$1;
			};

			for ( var i = 0; i < 10; i += 1 ) loop( i );`
	},

	{
		description:
			'maintains value of for loop variables between iterations, with conflict (#11)',

		input: `
			var i = 'conflicting';
			var fns = [];

			for ( let i = 0; i < 10; i += 1 ) {
				fns.push(function () { return i; });
				i += 1;
			}`,

		output: `
			var i = 'conflicting';
			var fns = [];

			var loop = function ( i$2 ) {
				fns.push(function () { return i$2; });
				i$2 += 1;

				i$1 = i$2;
			};

			for ( var i$1 = 0; i$1 < 10; i$1 += 1 ) loop( i$1 );`
	},

	{
		description:
			'loop variables with UpdateExpresssions between iterations (#150)',

		input: `
			var fns = [];

			for ( let i = 0, j = 3; i < 10; i += 1 ) {
				fns.push(function () { return i; });
				++i;
				j--;
			}`,

		output: `
			var fns = [];

			var loop = function ( i$1, j$1 ) {
				fns.push(function () { return i$1; });
				++i$1;
				j$1--;

				i = i$1;
				j = j$1;
			};

			for ( var i = 0, j = 3; i < 10; i += 1 ) loop( i, j );`
	},

	{
		description:
			'loop variables with UpdateExpresssions between iterations, with conflict (#150)',

		input: `
			var i = 'conflicting';
			var fns = [];

			for ( let i = 0; i < 10; i += 1 ) {
				fns.push(function () { return i; });
				i++;
			}`,

		output: `
			var i = 'conflicting';
			var fns = [];

			var loop = function ( i$2 ) {
				fns.push(function () { return i$2; });
				i$2++;

				i$1 = i$2;
			};

			for ( var i$1 = 0; i$1 < 10; i$1 += 1 ) loop( i$1 );`
	},

	{
		description: 'handles break and continue inside block-scoped loops (#12)',

		input: `
			function foo () {
				for ( let i = 0; i < 10; i += 1 ) {
					if ( i % 2 ) continue;
					if ( i > 5 ) break;
					if ( i === 'potato' ) return 'huh?';
					setTimeout( () => console.log( i ) );
				}
			}`,

		output: `
			function foo () {
				var loop = function ( i ) {
					if ( i % 2 ) { return; }
					if ( i > 5 ) { return 'break'; }
					if ( i === 'potato' ) { return { v: 'huh?' }; }
					setTimeout( function () { return console.log( i ); } );
				};

				for ( var i = 0; i < 10; i += 1 ) {
					var returned = loop( i );

					if ( returned === 'break' ) break;
					if ( returned ) return returned.v;
				}
			}`
	},

	{
		description: 'rewrites for-in loops as functions as necessary',

		input: `
			for ( let foo in bar ) {
				setTimeout( function () { console.log( bar[ foo ] ) } );
			}`,

		output: `
			var loop = function ( foo ) {
				setTimeout( function () { console.log( bar[ foo ] ) } );
			};

			for ( var foo in bar ) loop( foo );`
	},

	{
		description: 'allows breaking from for-in loops',

		input: `
			for ( let foo in bar ) {
				if ( foo === 'baz' ) break;
				setTimeout( function () { console.log( bar[ foo ] ) } );
			}`,

		output: `
			var loop = function ( foo ) {
				if ( foo === 'baz' ) { return 'break'; }
				setTimeout( function () { console.log( bar[ foo ] ) } );
			};

			for ( var foo in bar ) {
				var returned = loop( foo );

				if ( returned === 'break' ) break;
			}`
	},

	{
		description: 'transpiles block-less for-in statements',
		input: `for ( let foo in bar ) baz( foo );`,
		output: `for ( var foo in bar ) { baz( foo ); }`
	},

	{
		description: 'transpiles block-less for-in statements as functions',

		input: `
			for ( let foo in bar ) setTimeout( function () { log( foo ) } );`,

		output: `
			var loop = function ( foo ) {
				setTimeout( function () { log( foo ) } );
			};

			for ( var foo in bar ) loop( foo );`
	},

	{
		description:
			'does not incorrectly rename variables declared in for loop head',

		input: `
			for ( let foo = 0; foo < 10; foo += 1 ) {
				foo += 1;
				console.log( foo );
			}`,

		output: `
			for ( var foo = 0; foo < 10; foo += 1 ) {
				foo += 1;
				console.log( foo );
			}`
	},

	{
		description:
			'does not rewrite as function if `transforms.letConst === false`',
		options: { transforms: { letConst: false } },

		input: `
			for ( let i = 0; i < 10; i += 1 ) {
				setTimeout( function () {
					log( i );
				}, i * 100 );
			}`,

		output: `
			for ( let i = 0; i < 10; i += 1 ) {
				setTimeout( function () {
					log( i );
				}, i * 100 );
			}`
	},

	{
		description: 'calls synthetic loop function with correct argument',

		input: `
			let i = 999;

			for ( let i = 0; i < 10; i += 1 ) {
				setTimeout( () => console.log( i ) );
			}`,

		output: `
			var i = 999;

			var loop = function ( i ) {
				setTimeout( function () { return console.log( i ); } );
			};

			for ( var i$1 = 0; i$1 < 10; i$1 += 1 ) loop( i$1 );`
	},

	{
		description: 'handles body-less do-while loops (#27)',
		input: `do foo(); while (bar)`,
		output: `do { foo(); } while (bar)`
	},

	{
		description: 'returns without a value from loop',

		input: `
			function foo ( x ) {
				for ( let i = 0; i < x; i += 1 ) {
					setTimeout( () => {
						console.log( i );
					});

					if ( x > 5 ) return;
				}
			}`,

		output: `
			function foo ( x ) {
				var loop = function ( i ) {
					setTimeout( function () {
						console.log( i );
					});

					if ( x > 5 ) { return {}; }
				};

				for ( var i = 0; i < x; i += 1 ) {
					var returned = loop( i );

					if ( returned ) return returned.v;
				}
			}`
	},

	{
		description: 'supports two compiled loops in one function',

		input: `
			function foo ( x ) {
				for ( let i = 0; i < x; i += 1 ) {
					setTimeout( () => {
						console.log( i );
					});

					if ( x > 5 ) return;
				}

				for ( let i = 0; i < x; i += 1 ) {
					setTimeout( () => {
						console.log( i );
					});

					if ( x > 5 ) return;
				}
			}`,

		output: `
			function foo ( x ) {
				var loop = function ( i ) {
					setTimeout( function () {
						console.log( i );
					});

					if ( x > 5 ) { return {}; }
				};

				for ( var i = 0; i < x; i += 1 ) {
					var returned = loop( i );

					if ( returned ) return returned.v;
				}

				var loop$1 = function ( i ) {
					setTimeout( function () {
						console.log( i );
					});

					if ( x > 5 ) { return {}; }
				};

				for ( var i$1 = 0; i$1 < x; i$1 += 1 ) {
					var returned$1 = loop$1( i$1 );

					if ( returned$1 ) return returned$1.v;
				}
			}`
	},

	{
		description: 'destructures variable declaration in for loop head',

		input: `
			var range = { start: 10, end: 20 };

			for ( var { start: i, end } = range; i < end; i += 1 ) {
				console.log( i );
			}`,

		output: `
			var range = { start: 10, end: 20 };

			for ( var i = range.start, end = range.end; i < end; i += 1 ) {
				console.log( i );
			}`
	},

	{
		description:
			'complex destructuring in variable declaration in for loop head',

		input: `
			var range = function () {
				return { start: 10, end: 20 };
			}

			for ( var { start: i, end = 100 } = range(); i < end; i += 1 ) {
				console.log( i );
			}`,

		output: `
			var range = function () {
				return { start: 10, end: 20 };
			}

			for ( var ref = range(), i = ref.start, end = ref.end === undefined ? 100 : ref.end; i < end; i += 1 ) {
				console.log( i );
			}`
	},

	{
		description:
			'arrow functions in block-less for loops in a block-less if/else chain (#110)',

		input: `
			if (x)
				for (let i = 0; i < a.length; ++i)
					(() => { console.log(a[i]); })();
			else if (y)
				for (let i = 0; i < b.length; ++i)
					(() => { console.log(b[i]); })();
			else
				for (let i = 0; i < c.length; ++i)
					(() => { console.log(c[i]); })();
		`,

		// the indentation is not ideal, but the code is correct...
		output: `
			if (x)
				{ var loop = function ( i ) {
						(function () { console.log(a[i]); })();
					};

					for (var i = 0; i < a.length; ++i)
					loop( i ); }
			else if (y)
				{ var loop$1 = function ( i ) {
						(function () { console.log(b[i]); })();
					};

					for (var i$1 = 0; i$1 < b.length; ++i$1)
					loop$1( i$1 ); }
			else
				{ var loop$2 = function ( i ) {
				(function () { console.log(c[i]); })();
			};

			for (var i$2 = 0; i$2 < c.length; ++i$2)
					loop$2( i$2 ); }
		`
	},

	{
		description: 'always initialises block-scoped variable in loop (#124)',

		input: `
			for (let i = 0; i < 10; i++) {
				let something;
				if (i % 2) something = true;
				console.log(something);
			}`,

		output: `
			for (var i = 0; i < 10; i++) {
				var something = (void 0);
				if (i % 2) { something = true; }
				console.log(something);
			}`
	},

	{
		description:
			'always initialises block-scoped variable in for-of loop (#125)',

		options: { transforms: { dangerousForOf: true } },

		input: `
			for (let a = 0; a < 10; a++) {
				let j = 1, k;
				for (let b of c) {
					let x, y = 2
					f(b, j, k, x, y)
				}
			}
		`,
		output: `
			for (var a = 0; a < 10; a++) {
				var j = 1, k = (void 0);
				for (var i = 0, list = c; i < list.length; i += 1) {
					var b = list[i];

					var x = (void 0), y = 2
					f(b, j, k, x, y)
				}
			}
		`
	},

	{
		description:
			'always initialises block-scoped variable in simple for-of loop (#125)',

		options: { transforms: { dangerousForOf: true } },

		input: `
			for (let b of c) {
				let x, y = 2, z;
				f(b, x++, y++, z++)
			}
		`,
		output: `
			for (var i = 0, list = c; i < list.length; i += 1) {
				var b = list[i];

				var x = (void 0), y = 2, z = (void 0);
				f(b, x++, y++, z++)
			}
		`
	},

	{
		description: 'always initialises block-scoped variable in for-in loop',

		input: `
			for (let k in obj) {
				var r = 1, s, t;
				let x, y = 2, z;
				f(k, r++, s++, t++, x++, y++, z++)
			}
		`,
		output: `
			for (var k in obj) {
				var r = 1, s, t;
				var x = (void 0), y = 2, z = (void 0);
				f(k, r++, s++, t++, x++, y++, z++)
			}
		`
	},

	{
		description:
			'use alias for this in right side of nested for-in loop declaration (#142)',

		input: `
			let arr = [];
			class Foo {
				constructor () {
					this.foo = { a: 1, b: 2 };
				}
				do() {
					for ( let move = 0; move < 5; ++move ) {
						for ( let id in this.foo )
							arr.push( id );

						( () => { arr.push( move ); } )( move );
					}
					console.log( arr.join( ' ' ) );
				}
			}
			new Foo().do();
		`,
		output: `
			var arr = [];
			var Foo = function Foo () {
				this.foo = { a: 1, b: 2 };
			};
			Foo.prototype.do = function do$1 () {
					var this$1 = this;

				var loop = function ( move ) {
					for ( var id in this$1.foo )
						{ arr.push( id ); }

					( function () { arr.push( move ); } )( move );
				};

					for ( var move = 0; move < 5; ++move ) loop( move );
				console.log( arr.join( ' ' ) );
			};
			new Foo().do();
		`
	},

	{
		description:
			'use alias for this in right side of nested for-of loop declaration (#142)',

		options: { transforms: { dangerousForOf: true } },

		input: `
			let arr = [];
			class Foo {
				constructor () {
					this.foo = [ 9, 7 ];
				}
				do() {
					for ( let move = 0; move < 5; ++move ) {
						for ( let id of this.foo )
							arr.push( id );

						( () => { arr.push( move ); } )( move );
					}
					console.log( arr.join( ' ' ) );
				}
			}
			new Foo().do();
		`,
		output: `
			var arr = [];
			var Foo = function Foo () {
				this.foo = [ 9, 7 ];
			};
			Foo.prototype.do = function do$1 () {
					var this$1 = this;

				var loop = function ( move ) {
					for ( var i = 0, list = this$1.foo; i < list.length; i += 1 )
						{
							var id = list[i];

							arr.push( id );
						}

					( function () { arr.push( move ); } )( move );
				};

					for ( var move = 0; move < 5; ++move ) loop( move );
				console.log( arr.join( ' ' ) );
			};
			new Foo().do();
		`
	}
];
