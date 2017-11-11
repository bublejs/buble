module.exports = [
	{
		description: 'interpolations inside interpolations',
		input: 'var string = `foo${`${bar}`}`',
		output: `var string = "foo" + ("" + bar)`
	}];
