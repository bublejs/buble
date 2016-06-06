module.exports = [
	{
		description: 'transpiles object spread with one object',
		input: `var obj = {...a};`,
		output: `var obj = Object.assign({}, a);`
	},
	{
		description: 'transpiles object spread with two objects',
		input: `var obj = {...a, ...b};`,
		output: `var obj = Object.assign({}, a, b);`
	},
	{
		description: 'transpiles object rest spread with regular keys in between',
		input: `var obj = { ...a, b: 1, c: 2 };`,
		output: `var obj = Object.assign({}, a, {b: 1, c: 2});`
	},
	{
		description: 'transpiles object rest spread mixed',
		input: `var obj = { ...a, b: 1, ...d, e};`,
		output: `var obj = Object.assign({}, a, {b: 1}, d, {e: e});`
	},
	{
		description: 'transpiles object rest spread nested',
		input: `var obj = { ...a, b: 1, dd: {...d, f: 1}, e};`,
		output: `var obj = Object.assign({}, a, {b: 1, dd: Object.assign({}, d, {f: 1}), e: e});`
  },
	{
		description: 'transpiles object rest spread deeply nested',
		input: `const c = { ...a, b: 1, dd: {...d, f: 1, gg: {h, ...g, ii: {...i}}}, e};`,
		output: `var c = Object.assign({}, a, {b: 1, dd: Object.assign({}, d, {f: 1, gg: Object.assign({}, {h: h}, g, {ii: Object.assign({}, i)})}), e: e});`
	}
];
