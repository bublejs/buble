module.exports = [
	{
		description: 'strips trailing commas in call arguments',

		input: `
			f(a,)`,

		output: `
			f(a)`
	},

	{
		description: 'strips trailing commas in function expression arguments',

		input: `
			let f = function (a,) {}`,

		output: `
			var f = function (a) {}`
	},

	{
		description: 'strips trailing commas in normal function declaration arguments',

		input: `
			function f(a,) {}`,

		output: `
			function f(a) {}`
	},

	{
		description: 'strips trailing commas in method arguments',

		input: `
			class A {
				f(a,) {}
			}`,

		output: `
			var A = function A () {};

			A.prototype.f = function f (a) {};`
	},

	{
		description: 'strips trailing commas in arrow function declaration arguments',

		input: `
			((a,) => {})`,

		output: `
			(function (a) {})`
	},

	{
		description: 'strips trailing commas after destructured argument in arrow function declaration arguments',

		input: `
			((a,[b],{c},) => {})`,

		output: `
			(function (a,ref,ref$1) {
				var b = ref[0];
				var c = ref$1.c;
})`
	}
];
