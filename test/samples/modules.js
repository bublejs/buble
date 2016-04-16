module.exports = [
	{
		description: 'disallows import statement',
		input: `import 'foo';`,
		error: /import is not supported/
	},

	{
		description: 'disallows export statement',
		input: `export { foo };`,
		error: /export is not supported/
	},

	{
		description: 'imports are ignored with `transforms.moduleImport === false`',
		options: { transforms: { moduleImport: false } },
		input: `import 'foo';`,
		output: `import 'foo';`
	},

	{
		description: 'exports are ignored with `transforms.moduleExport === false`',
		options: { transforms: { moduleExport: false } },
		input: `export { foo };`,
		output: `export { foo };`
	},

	{
		description: 'imports and exports are ignored with `transforms.modules === false`',
		options: { transforms: { modules: false } },
		input: `import 'foo'; export { foo };`,
		output: `import 'foo'; export { foo };`
	}
];
