module.exports = [
	{
		description: 'support dynamic import',
		options: { transforms: { moduleImport: false } },
		input: `import('./module.js')`,
		output: `import('./module.js')`
	}

];
