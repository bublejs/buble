module.exports = [
	{
		description: 'transpiles default parameters',

		input: `
			function foo ( a = 1, b = 2 ) {
				console.log( a, b );
			}

			var bar = function ( a = 1, b = 2 ) {
				console.log( a, b );
			};`,

		output: `
			function foo ( a, b ) {
				if ( a === void 0 ) a = 1;
				if ( b === void 0 ) b = 2;

				console.log( a, b );
			}

			var bar = function ( a, b ) {
				if ( a === void 0 ) a = 1;
				if ( b === void 0 ) b = 2;

				console.log( a, b );
			};`
	}
];
