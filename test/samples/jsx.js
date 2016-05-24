module.exports = [
	{
		description: 'transpiles self-closing JSX tag',
		input: `var img = <img src='foo.gif'/>;`,
		output: `var img = React.createElement( 'img', { src: 'foo.gif' });`
	},

	{
		description: 'transpiles non-self-closing JSX tag',
		input: `var div = <div className='foo'></div>;`,
		output: `var div = React.createElement( 'div', { className: 'foo' });`
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
				React.createElement( 'div', { className: 'foo' },
					React.createElement( 'img', { src: 'foo.gif' }),
					React.createElement( 'img', { src: 'bar.gif' })
				)
			);`
	},

	{
		description: 'transpiles JSX tag with expression attributes',
		input: `var img = <img src={src}/>;`,
		output: `var img = React.createElement( 'img', { src: src });`
	},

	{
		description: 'transpiles JSX tag with expression children',

		input: `
			var div = (
				<div>
					{ images.map( src => <img src={src}/> ) }
				</div>
			);`,

		output: `
			var div = (
				React.createElement( 'div', null,
					images.map( function (src) { return React.createElement( 'img', { src: src }); } )
				)
			);`
	},

	{
		description: 'transpiles JSX component',
		input: `var element = <Hello name={name}/>;`,
		output: `var element = React.createElement( Hello, { name: name });`
	},

	{
		description: 'transpiles namespaced JSX component',
		input: `var element = <Foo.Bar name={name}/>;`,
		output: `var element = React.createElement( Foo.Bar, { name: name });`
	}
];
