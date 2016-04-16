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
		description: 'transpiles block scoping inside while loops with function bodies',

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
		description: 'transpiles block scoping inside do-while loops with function bodies',

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
		description: 'transpiles block-less for loops with block-scoped declarations inside function body',

		input: `
			for ( let i = 0; i < 10; i += 1 ) setTimeout( () => console.log( i ), i * 100 );`,

		output: `
			var loop = function ( i ) {
				setTimeout( function () { return console.log( i ); }, i * 100 );
			};

			for ( var i = 0; i < 10; i += 1 ) loop( i );`
	},

	{
		description: 'transpiles block scoping inside loops without function bodies',

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
		description: 'transpiles block-less for loops without block-scoped declarations inside function body',

		input: `
			for ( let i = 0; i < 10; i += 1 ) console.log( i );`,

		output: `
			for ( var i = 0; i < 10; i += 1 ) console.log( i );`
	},

	{
		description: 'preserves correct `this` and `arguments` inside block scoped loop (#10)',

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
		description: 'maintains value of for loop variables between iterations (#11)',

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
		description: 'maintains value of for loop variables between iterations, with conflict (#11)',

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
					if ( i % 2 ) return;
					if ( i > 5 ) return 'break';
					if ( i === 'potato' ) return { v: 'huh?' };
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
				if ( foo === 'baz' ) return 'break';
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
		output: `for ( var foo in bar ) baz( foo );`
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
		description: 'does not incorrectly rename variables declared in for loop head',

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
		description: 'does not rewrite as function if `transforms.letConst === false`',
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
	}
];
