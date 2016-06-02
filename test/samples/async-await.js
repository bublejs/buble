module.exports = [
	{
		description: 'transpiles await arrow function call',
    input: `async () => await a()`,
    output: `function () { return Promise.resolve().then(function() { return a() }); }`
  },

	{
		description: 'transpiles await function call',
		input: `async function f() { await a(); }`,
    output: `function f() { return Promise.resolve().then(function() { return a(); }).then(function() {}) }`
  },

	{
		description: 'transpiles await function call with return statement',
		input: `async function f() { return await a(); }`,
    output: `function f() { return Promise.resolve().then(function() { return a(); }) }`
	},

	{
		description: 'transpiles await function call with more than one line of code',
		input: `async function f() { await a(); thing(); await a2(); stuff(); await a3(); await a4(); }`,
    output: `function f() { return Promise.resolve().then(function() { return a(); }) .then(function() { thing(); }) .then(function() { return a2(); }) .then(function() { stuff(); }) .then(function() { return a3(); }) .then(function() { return a4(); }).then(function() {}) }`
  }
];
