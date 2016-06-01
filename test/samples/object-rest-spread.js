module.exports = [
	{
		description: 'transpiles object spread with one object',
		input: `var a = {...b};`,
		output: `var a = Object.assign({}, b);`
	},
	{
		description: 'transpiles object spread with two objects',
		input: `var a = {...b, ...c};`,
		output: `var a = Object.assign({}, b, c);`
	},
	{
		description: 'transpiles object rest spread with regular keys in between',
		input: `const c = { ...a, b: 1};`,
		output: `var c = Object.assign({}, a, {b: 1});`
  },
	{
		description: 'transpiles object rest spread mixed',
		input: `const c = { ...a, b: 1, ...d, e};`,
		output: `var c = Object.assign({}, a, {b: 1}, d, {e: e});`
  },
	{
		description: 'transpiles object rest spread nested',
		input: `const c = { ...a, b: 1, dd: {...d, f: 1}, e};`,
		output: `var c = Object.assign({}, a, {b: 1}, {dd: Object.assign({}, d, {f: 1})}, {e: e});`
	}
]
