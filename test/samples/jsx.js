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
		description: 'transpiles empty JSX expression block',
		input: `var element = <Foo>{}</Foo>;`,
		output: `var element = React.createElement( Foo, null );`
	},

	{
		description: 'transpiles empty JSX expression block with comment',
		input: `var element = <Foo>{/* comment */}</Foo>;`,
		output: `var element = React.createElement( Foo, null/* comment */ );`
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
				!${'      '}
				It's  nice to meet you
			</h1>`,
		output: `
			React.createElement( 'h1', null, "Hello ", name, "! It's  nice to meet you" )`
	},

	{
		description: 'transpiles tag with data attribute',
		input: `var element = <div data-name={name}/>;`,
		output: `var element = React.createElement( 'div', { 'data-name': name });`
	},

	{
		description: 'transpiles JSX tag without value',
		input: `var div = <div contentEditable />;`,
		output: `var div = React.createElement( 'div', { contentEditable: true });`
	},

	{
		description: 'transpiles one JSX spread attributes',
		input: `var element = <div {...props} />;`,
		output: `var element = React.createElement( 'div', props);`
	},

	{
		description: 'disallow mixed JSX spread attributes ending in spread',
		input: `var element = <div a={1} {...props} {...stuff} />;`,
		error: /Mixed JSX attributes ending in spread requires specified objectAssign option with 'Object\.assign' or polyfill helper\./
	},

	{
		description: 'transpiles mixed JSX spread attributes ending in spread',
		options: {
			objectAssign: 'Object.assign'
		},
		input: `var element = <div a={1} {...props} {...stuff} />;`,
		output: `var element = React.createElement( 'div', Object.assign({}, { a: 1 }, props, stuff));`
	},

	{
		description:
			'transpiles mixed JSX spread attributes ending in spread with custom Object.assign',
		options: {
			objectAssign: 'angular.extend'
		},
		input: `var element = <div a={1} {...props} {...stuff} />;`,
		output: `var element = React.createElement( 'div', angular.extend({}, { a: 1 }, props, stuff));`
	},

	{
		description:
			'transpiles mixed JSX spread attributes ending in other values',
		options: {
			objectAssign: 'Object.assign'
		},
		input: `var element = <div a={1} {...props} b={2} c={3} {...stuff} more={things} />;`,
		output: `var element = React.createElement( 'div', Object.assign({}, { a: 1 }, props, { b: 2, c: 3 }, stuff, { more: things }));`
	},

	{
		description: 'transpiles spread expressions (#64)',
		input: `<div {...this.props}/>`,
		output: `React.createElement( 'div', this.props)`
	},

	{
		description: 'handles whitespace between elements on same line (#65)',

		input: `
			<Foo> <h1>Hello {name}!</h1>   </Foo>`,

		output: `
			React.createElement( Foo, null, " ", React.createElement( 'h1', null, "Hello ", name, "!" ), "   " )`
	},

	{
		description: 'fix Object.assign regression in JSXOpeningElement (#163)',

		options: {
			objectAssign: 'Object.assign'
		},
		input: `
			<Thing two={"This no longer fails"} {...props}></Thing>
		`,
		output: `
			React.createElement( Thing, Object.assign({}, { two: "This no longer fails" }, props))
		`
	},

	{
		description: 'fix no space between JSXOpeningElement attributes (#178)',

		input: `
			<div style={{color:'#000000'}}className='content'/>
		`,
		output: `
			React.createElement( 'div', { style: {color:'#000000'}, className: 'content' })
		`
	},

	{
		description: 'supports /* @jsx customPragma */ directives (#195)',
		input: `
			/* @jsx customPragma */
			var div = <div>Hello</div>
		`,
		output: `
			/* @jsx customPragma */
			var div = customPragma( 'div', null, "Hello" )
		`
	},

	{
		description: 'ignores subsequent /* @jsx customPragma */ directives (#195)',
		input: `
			/* @jsx customPragma */
			/* @jsx customPragmaWannabe */
			var div = <div>Hello</div>
		`,
		output: `
			/* @jsx customPragma */
			/* @jsx customPragmaWannabe */
			var div = customPragma( 'div', null, "Hello" )
		`
	},

	{
		description: 'handles dash-cased value-less props',

		input: `
			<Thing data-foo></Thing>
		`,
		output: `
			React.createElement( Thing, { 'data-foo': true })
		`
	},

	{
		description: 'handles non-breaking white-space entities',

		input: `
			<div>
				<a>1</a>&nbsp;
				&nbsp;
			</div>
		`,
		output: `
			React.createElement( 'div', null,
				React.createElement( 'a', null, "1" ), "&nbsp; &nbsp;")
		`
	}
];
