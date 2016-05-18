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
	},

	{
		description: 'transpiles destructured default parameters (#23)',

		input: `
			function foo ({ a = 1 }, { b = 2 }) {
				console.log( a, b );
			}

			var bar = function ({ a = 1 }, { b = 2 }) {
				console.log( a, b );
			};`,

		output: `
			function foo (ref, ref$1) {
				var ref_a = ref.a, a = ref_a === void 0 ? 1 : ref_a;
				var ref$1_b = ref$1.b, b = ref$1_b === void 0 ? 2 : ref$1_b;

				console.log( a, b );
			}

			var bar = function (ref, ref$1) {
				var ref_a = ref.a, a = ref_a === void 0 ? 1 : ref_a;
				var ref$1_b = ref$1.b, b = ref$1_b === void 0 ? 2 : ref$1_b;

				console.log( a, b );
			};`
	},

	{
		description: 'can be disabled with `transforms.defaultParameter: false`',
		options: { transforms: { defaultParameter: false } },

		input: `
			function foo ( a = 1, b = 2 ) {
				console.log( a, b );
			}

			var bar = function ( a = 1, b = 2 ) {
				console.log( a, b );
			};`,

		output: `
			function foo ( a = 1, b = 2 ) {
				console.log( a, b );
			}

			var bar = function ( a = 1, b = 2 ) {
				console.log( a, b );
			};`
	},

	{
		description: 'transpiles default arrow function parameters',

		input: `
			function a(x, f = () => x) {
				console.log( f() );
			}`,

		output: `
			function a(x, f) {
				if ( f === void 0 ) f = function () { return x; };

				console.log( f() );
			}`
	},

	{
		description: 'transpiles destructured default parameters (#43)',

		input: `
			function a({ x } = {}) {
				console.log( x );
			}`,

		output: `
			function a(ref) {
				if ( ref === void 0 ) ref = {};

				console.log( ref.x );
			}`
	}
];
