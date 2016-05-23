module.exports = [
	{
		description: 'transpiles self-closing JSX tag',
		input: `var img = <img src='foo.gif'/>;`,
		output: `var img = React.createElement('img', { src: 'foo.gif' });`
	},

	{
		description: 'transpiles non-self-closing JSX tag',
		input: `var div = <div className='foo'></div>;`,
		output: `var div = React.createElement('div', { className: 'foo' });`
	},

	{
		description: 'transpiles nested JSX tags',

		input: `
			var div = (
				<div className='foo'>
					<img src='foo.gif'/>
					<img src='bar.gif'/>
				</div>
			);`,

		output: `
			var div = (
				React.createElement('div', { className: 'foo' },
					React.createElement('img', { src: 'foo.gif' }),
					React.createElement('img', { src: 'bar.gif' })
				)
			);`
	}
];
