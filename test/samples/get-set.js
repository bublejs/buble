module.exports = [
	{
		description: 'is disabled by default for classes',
		input: `class X {
			get x() {}
		}`,
		output: `var X = function X () {};

var prototypeAccessors = { x: { configurable: true } };

prototypeAccessors.x.get = function () {};

Object.defineProperties( X.prototype, prototypeAccessors );`,
	},

	{
		description: 'is disabled by default for objects',
		input: `X = {
			get x() {}
		}`,
		output: `X = {
			get x() {}
		}`,
	},

	{
		description: 'can be explicitly enabled for classes',
		options: { transforms: { getterSetter: true } },
		input: `class X {
			get x() {}
		}`,
		error: 'getters and setters are not supported. Use `transforms: { getterSetter: false }` to skip transformation and disable this error (2:3)'
	},

	{
		description: 'can be explicitly enabled for objects',
		options: { transforms: { getterSetter: true } },
		input: `X = {
			get x() {}
		}`,
		error: 'getters and setters are not supported. Use `transforms: { getterSetter: false }` to skip transformation and disable this error (2:3)'
	},

	{
		description: 'are automatically enabled for ie8 for classes',
		options: { target: { ie: 8 } },
		input: `class X {
			get x() {}
		}`,
		error: 'getters and setters are not supported. Use `transforms: { getterSetter: false }` to skip transformation and disable this error (2:3)'
	},

	{
		description: 'are automatically enabled for ie8 for objects',
		options: { target: { ie: 8 } },
		input: `X = {
			get x() {}
		}`,
		error: 'getters and setters are not supported. Use `transforms: { getterSetter: false }` to skip transformation and disable this error (2:3)'
	},
]
