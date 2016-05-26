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
		description: 'transpiles non-self-closing JSX tag without attributes',
		input: `var div = <div></div>;`,
		output: `var div = React.createElement( 'div', null );`
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
		description: 'transpiles JSX component without attributes',
		input: `var element = <Hello />;`,
		output: `var element = React.createElement( Hello, null );`
	},

	{
		description: 'transpiles JSX component without attributes with children',
		input: `var element = <Hello>hello</Hello>;`,
		output: `var element = React.createElement( Hello, null, "hello" );`
	},

	{
		description: 'transpiles namespaced JSX component',
		input: `var element = <Foo.Bar name={name}/>;`,
		output: `var element = React.createElement( Foo.Bar, { name: name });`
	},

	{
		description: 'supports pragmas',
		options: { jsx: 'NotReact.createElement' },
		input: `var img = <img src='foo.gif'/>;`,
		output: `var img = NotReact.createElement( 'img', { src: 'foo.gif' });`
	},

	{
		description: 'stringifies text children',
		input: `<h1>Hello {name}!</h1>`,
		output: `React.createElement( 'h1', null, "Hello ", name, "!" )`
	},

	{
		description: 'handles whitespace and quotes appropriately',
		input: `
			<h1>
				Hello {name}
				!
			</h1>`,
		output: `
			React.createElement( 'h1', null, "Hello ", name, "!" )`
	},

	{
		description: 'handles single-line whitespace and quotes appropriately',
		input: `
			<h1>
				Hello {name} – and goodbye!
			</h1>`,
		output: `
			React.createElement( 'h1', null, "Hello ", name, " – and goodbye!" )`
	},

	{
		description: 'handles single quotes in text children',
		input: `
			<h1>
				Hello {name}
				!${"      "}
				It's  nice to meet you
			</h1>`,
		output: `
			React.createElement( 'h1', null, "Hello ", name, "! It's  nice to meet you" )`
	}
];
