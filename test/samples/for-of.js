module.exports = [
	{
		description: 'disallows for-of statements',
		input: `for ( x of y ) {}`,
		error: /for\.\.\.of statements are not supported/
	},

	{
		description: 'ignores for-of with `transforms.forOf === false`',
		options: { transforms: { forOf: false } },
		input: `for ( x of y ) {}`,
		output: `for ( x of y ) {}`
	},

	{
		description: 'transpiles for-of with array assumption with `transforms.dangerousForOf`',
		options: { transforms: { dangerousForOf: true } },

		input: `
			for ( let member of array ) {
				doSomething( member );
			}`,

		output: `
			for ( var i = 0, list = array, useLen = typeof list.length === 'number' || typeof Symbol !== 'function', list = useLen ? list : list[Symbol.iterator](); useLen ? i < list.length : !(i = list.next()).done; ) {
				var member = useLen ? list[i++] : i.value;

				doSomething( member );
			}`
	},

	{
		description: 'transpiles for-of with expression',
		options: { transforms: { dangerousForOf: true } },

		input: `
			for ( let member of [ 'a', 'b', 'c' ] ) {
				doSomething( member );
			}`,

		output: `
			for ( var i = 0, list = [ 'a', 'b', 'c' ], useLen = typeof list.length === 'number' || typeof Symbol !== 'function', list = useLen ? list : list[Symbol.iterator](); useLen ? i < list.length : !(i = list.next()).done; ) {
				var member = useLen ? list[i++] : i.value;

				doSomething( member );
			}`
	},

	{
		description: 'transpiles for-of that needs to be rewritten as function',
		options: { transforms: { dangerousForOf: true } },

		input: `
			for ( let member of [ 'a', 'b', 'c' ] ) {
				setTimeout( function () {
					doSomething( member );
				});
			}`,

		output: `
			var loop = function () {
				var member = useLen ? list[i++] : i.value;

				setTimeout( function () {
					doSomething( member );
				});
			};

			for ( var i = 0, list = [ 'a', 'b', 'c' ], useLen = typeof list.length === 'number' || typeof Symbol !== 'function', list = useLen ? list : list[Symbol.iterator](); useLen ? i < list.length : !(i = list.next()).done; ) loop();`
	},

	{
		description: 'transpiles body-less for-of',
		options: { transforms: { dangerousForOf: true } },

		input: `
			for ( let member of array ) console.log( member );`,

		output: `
			for ( var i = 0, list = array, useLen = typeof list.length === 'number' || typeof Symbol !== 'function', list = useLen ? list : list[Symbol.iterator](); useLen ? i < list.length : !(i = list.next()).done; ) {
				var member = useLen ? list[i++] : i.value;

				console.log( member );
			}`
	},

	{
		description: 'transpiles space-less for-of',
		options: { transforms: { dangerousForOf: true } },

		input: `
			for (const key of this.keys) {
				console.log(key);
			}`,

		output: `
			for (var i = 0, list = this.keys, useLen = typeof list.length === 'number' || typeof Symbol !== 'function', list = useLen ? list : list[Symbol.iterator](); useLen ? i < list.length : !(i = list.next()).done;) {
				var key = useLen ? list[i++] : i.value;

				console.log(key);
			}`
	},

	{
		description: 'handles continue in for-of',
		options: { transforms: { dangerousForOf: true } },

		input: `
			for ( let item of items ) {
				if ( item.foo ) continue;
			}`,

		output: `
			for ( var i = 0, list = items, useLen = typeof list.length === 'number' || typeof Symbol !== 'function', list = useLen ? list : list[Symbol.iterator](); useLen ? i < list.length : !(i = list.next()).done; ) {
				var item = useLen ? list[i++] : i.value;

				if ( item.foo ) { continue; }
			}`

	},

	{
		description: 'handles this and arguments in for-of',
		options: { transforms: { dangerousForOf: true } },

		input: `
			for ( let item of items ) {
				console.log( this, arguments, item );
				setTimeout( () => {
					console.log( item );
				});
			}`,

		output: `
			var arguments$1 = arguments;
			var this$1 = this;

			var loop = function () {
				var item = useLen ? list[i++] : i.value;

				console.log( this$1, arguments$1, item );
				setTimeout( function () {
					console.log( item );
				});
			};

			for ( var i = 0, list = items, useLen = typeof list.length === 'number' || typeof Symbol !== 'function', list = useLen ? list : list[Symbol.iterator](); useLen ? i < list.length : !(i = list.next()).done; ) loop();`
	},

	{
		description: 'for-of with empty block (#80)',
		options: { transforms: { dangerousForOf: true } },

		input: `
			for ( let x of y ) {}`,

		output: `
			`
	},

	{
		description: 'for-of with empty block and var (#80)',
		options: { transforms: { dangerousForOf: true } },

		input: `
			for ( var x of y ) {}`,

		output: `
			var x;`
	},

	{
		description: 'return from for-of loop rewritten as function',
		options: { transforms: { dangerousForOf: true } },

		input: `
			function foo () {
				for ( let x of y ) {
					setTimeout( function () {
						console.log( x );
					});

					if ( x > 10 ) return;
				}
			}`,

		output: `
			function foo () {
				var loop = function () {
					var x = useLen ? list[i++] : i.value;

					setTimeout( function () {
						console.log( x );
					});

					if ( x > 10 ) { return {}; }
				};

				for ( var i = 0, list = y, useLen = typeof list.length === 'number' || typeof Symbol !== 'function', list = useLen ? list : list[Symbol.iterator](); useLen ? i < list.length : !(i = list.next()).done; ) {
					var returned = loop();

					if ( returned ) return returned.v;
				}
			}`
	},

	{
		description: 'allows destructured variable declaration (#95)',
		options: { transforms: { dangerousForOf: true } },

		input: `
			for (var {x, y} of [{x: 1, y: 2}]) {
				console.log(x, y);
			}`,

		output: `
			for (var i = 0, list = [{x: 1, y: 2}], useLen = typeof list.length === 'number' || typeof Symbol !== 'function', list = useLen ? list : list[Symbol.iterator](); useLen ? i < list.length : !(i = list.next()).done;) {
				var ref = useLen ? list[i++] : i.value;
				var x = ref.x;
				var y = ref.y;

				console.log(x, y);
			}`
	}
];
