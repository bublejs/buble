module.exports = [
	{
		description: 'disallows object spread operator',
		input: 'var obj = {...a};',
		error: /Object spread operator requires specified objectAssign option with 'Object\.assign' or polyfill helper\./
	},

	{
		description: 'transpiles object spread with one object',
		options: {
			objectAssign: 'Object.assign'
		},
		input: `var obj = {...a};`,
		output: `var obj = Object.assign({}, a);`
	},

	{
		description: 'transpiles object spread with two objects',
		options: {
			objectAssign: 'Object.assign'
		},
		input: `var obj = {...a, ...b};`,
		output: `var obj = Object.assign({}, a, b);`
	},

	{
		description: 'transpiles object spread with regular keys in between',
		options: {
			objectAssign: 'Object.assign'
		},
		input: `
			var obj = { ...a, b: 1, c: 2 };
		`,
		output: `
			var obj = Object.assign({}, a);
			obj.b = 1;
			obj.c = 2;
		`
	},

	{
		description: 'transpiles object spread mixed',
		options: {
			objectAssign: 'Object.assign'
		},
		input: `
			var obj = { ...a, b: 1, ...d, e};
		`,
		output: `
			var obj = Object.assign({}, a);
			obj.b = 1;
			Object.assign(obj, d);
			obj.e = e;
		`
	},

	{
		description: 'transpiles objects with spread with computed property (#144)',
		options: {
			objectAssign: 'Object.assign'
		},
		input: `
			var a0 = { [ x ] : true , ... y };
			var a1 = { [ w ] : 0 , [ x ] : true , ... y };
			var a2 = { v, [ w ] : 0, [ x ] : true, ... y };
			var a3 = { [ w ] : 0, [ x ] : true };
			var a4 = { [ w ] : 0 , [ x ] : true , y };
			var a5 = { k : 9 , [ x ] : true, ... y };
			var a6 = { ... y, [ x ] : true };
			var a7 = { ... y, [ w ] : 0, [ x ] : true };
			var a8 = { k : 9, ... y, [ x ] : true };
			var a9 = { [ x ] : true , [ y ] : false , [ z ] : 9 };
			var a10 = { [ x ] : true, ...y, p, ...q };
			var a11 = { x, [c] : 9 , y };
			var a12 = { ...b, [c]:3, d:4 };
		`,
		output: `
			var a0 = {};
			a0[ x ] = true;
			Object.assign(a0, y);
			var a1 = {};
			a1[ w ] = 0;
			a1[ x ] = true;
			Object.assign(a1, y);
			var a2 = { v: v };
			a2[ w ] = 0;
			a2[ x ] = true;
			Object.assign(a2, y);
			var a3 = {};
			a3[ w ] = 0;
			a3[ x ] = true;
			var a4 = {};
			a4[ w ] = 0;
			a4[ x ] = true;
			a4.y = y;
			var a5 = { k : 9 };
			a5[ x ] = true;
			Object.assign(a5, y);
			var a6 = Object.assign({}, y);
			a6[ x ] = true;
			var a7 = Object.assign({}, y);
			a7[ w ] = 0;
			a7[ x ] = true;
			var a8 = Object.assign({ k : 9 }, y);
			a8[ x ] = true;
			var a9 = {};
			a9[ x ] = true;
			a9[ y ] = false;
			a9[ z ] = 9;
			var a10 = {};
			a10[ x ] = true;
			Object.assign(a10, y);
			a10.p = p;
			Object.assign(a10, q);
			var a11 = { x: x };
			a11[c] = 9;
			a11.y = y;
			var a12 = Object.assign({}, b);
			a12[c] = 3;
			a12.d = 4;
		`
	},
	{
		description: 'doesn\'t transpile objects with spread with computed property if disabled',
		options: {
			objectAssign: 'Object.assign',
			transforms: { objectRestSpread: false, computedProperty: false, conciseMethodProperty: false }
		},
		input: `
			var a0 = { [ x ] : true , ... y };
			var a1 = { [ w ] : 0 , [ x ] : true , ... y };
			var a2 = { v, [ w ] : 0, [ x ] : true, ... y };
			var a3 = { [ w ] : 0, [ x ] : true };
			var a4 = { [ w ] : 0 , [ x ] : true , y };
			var a5 = { k : 9 , [ x ] : true, ... y };
			var a6 = { ... y, [ x ] : true };
			var a7 = { ... y, [ w ] : 0, [ x ] : true };
			var a8 = { k : 9, ... y, [ x ] : true };
			var a9 = { [ x ] : true , [ y ] : false , [ z ] : 9 };
			var a10 = { [ x ] : true, ...y, p, ...q };
			var a11 = { x, [c] : 9 , y };
			var a12 = { ...b, [c]:3, d:4 };
		`,
		output: `
			var a0 = { [ x ] : true , ... y };
			var a1 = { [ w ] : 0 , [ x ] : true , ... y };
			var a2 = { v, [ w ] : 0, [ x ] : true, ... y };
			var a3 = { [ w ] : 0, [ x ] : true };
			var a4 = { [ w ] : 0 , [ x ] : true , y };
			var a5 = { k : 9 , [ x ] : true, ... y };
			var a6 = { ... y, [ x ] : true };
			var a7 = { ... y, [ w ] : 0, [ x ] : true };
			var a8 = { k : 9, ... y, [ x ] : true };
			var a9 = { [ x ] : true , [ y ] : false , [ z ] : 9 };
			var a10 = { [ x ] : true, ...y, p, ...q };
			var a11 = { x, [c] : 9 , y };
			var a12 = { ...b, [c]:3, d:4 };
		`
	},
	{
		description: 'supports transpiling spread properties if computed properties shouldn\'t be transpiled',
		options: {
			objectAssign: 'Object.assign',
			transforms: { computedProperty: false, conciseMethodProperty: false }
		},
		input: `
			var a0 = { [ x ] : true , ... y };
		`,
		output: `
			var a0 = Object.assign({ [ x ] : true } , y);
		`,
	},
	{
		description: 'supports transpiling computed properties if spread properties shouldn\'t be transpiled',
		options: {
			objectAssign: 'Object.assign',
			transforms: { objectRestSpread: false, conciseMethodProperty: false }
		},
		input: `
			var a0 = { [ x ] : true , ... y };
		`,
		output: `
			var a0 = {};
			a0[ x ] = true;
			Object.assign(a0, y);
		`,
	},
	{
		description:
			'transpiles inline objects with spread with computed property (#144)',
		options: {
			objectAssign: 'Object.assign'
		},
		input: `
			f0( { [ x ] : true , ... y } );
			f1( { [ w ] : 0 , [ x ] : true , ... y } );
			f2( { v, [ w ] : 0, [ x ] : true, ... y } );
			f3( { [ w ] : 0, [ x ] : true } );
			f4( { [ w ] : 0 , [ x ] : true , y } );
			f5( { k : 9 , [ x ] : true, ... y } );
			f6( { ... y, [ x ] : true } );
			f7( { ... y, [ w ] : 0, [ x ] : true } );
			f8( { k : 9, ... y, [ x ] : true } );
			f9( { [ x ] : true , [ y ] : false , [ z ] : 9 } );
			f10( { [ x ] : true, ...y, p, ...q } );
			f11( { x, [c] : 9 , y } );
			f12({ ...b, [c]:3, d:4 });
		`,
		output: `
			var obj, obj$1, obj$2, obj$3, obj$4, obj$5, obj$6, obj$7, obj$8, obj$9, obj$10, obj$11, obj$12;

			f0( ( obj = {}, obj[ x ] = true, Object.assign(obj, y) ) );
			f1( ( obj$1 = {}, obj$1[ w ] = 0, obj$1[ x ] = true, Object.assign(obj$1, y) ) );
			f2( ( obj$2 = { v: v }, obj$2[ w ] = 0, obj$2[ x ] = true, Object.assign(obj$2, y) ) );
			f3( ( obj$3 = {}, obj$3[ w ] = 0, obj$3[ x ] = true, obj$3 ) );
			f4( ( obj$4 = {}, obj$4[ w ] = 0, obj$4[ x ] = true, obj$4.y = y, obj$4 ) );
			f5( ( obj$5 = { k : 9 }, obj$5[ x ] = true, Object.assign(obj$5, y) ) );
			f6( ( obj$6 = Object.assign({}, y), obj$6[ x ] = true, obj$6 ) );
			f7( ( obj$7 = Object.assign({}, y), obj$7[ w ] = 0, obj$7[ x ] = true, obj$7 ) );
			f8( ( obj$8 = Object.assign({ k : 9 }, y), obj$8[ x ] = true, obj$8 ) );
			f9( ( obj$9 = {}, obj$9[ x ] = true, obj$9[ y ] = false, obj$9[ z ] = 9, obj$9 ) );
			f10( ( obj$10 = {}, obj$10[ x ] = true, Object.assign(obj$10, y), obj$10.p = p, Object.assign(obj$10, q) ) );
			f11( ( obj$11 = { x: x }, obj$11[c] = 9, obj$11.y = y, obj$11 ) );
			f12(( obj$12 = Object.assign({}, b), obj$12[c] = 3, obj$12.d = 4, obj$12 ));
		`
	},

	{
		description: 'transpiles object spread nested',
		options: {
			objectAssign: 'Object.assign'
		},
		input: `
			var obj = { ...a, b: 1, dd: {...d, f: 1}, e};
		`,
		output: `
			var obj$1;

			var obj = Object.assign({}, a);
			obj.b = 1;
			obj.dd = ( obj$1 = Object.assign({}, d), obj$1.f = 1, obj$1 );
			obj.e = e;
		`
	},

	{
		description: 'transpiles object spread deeply nested',
		options: {
			objectAssign: 'Object.assign'
		},
		input: `
			const c = { ...a, b: 1, dd: {...d, f: 1, gg: {h, ...g, ii: {...i}}}, e};
		`,
		output: `
			var obj, obj$1;

			var c = Object.assign({}, a);
			c.b = 1;
			c.dd = ( obj$1 = Object.assign({}, d), obj$1.f = 1, obj$1.gg = ( obj = Object.assign({h: h}, g), obj.ii = Object.assign({}, i), obj ), obj$1 );
			c.e = e;
		`
	},

	{
		description: 'transpiles object spread with custom Object.assign',
		options: {
			objectAssign: 'angular.extend'
		},
		input: `
			var obj = { ...a, b: 1, dd: {...d, f: 1}, e};
		`,
		output: `
			var obj$1;

			var obj = angular.extend({}, a);
			obj.b = 1;
			obj.dd = ( obj$1 = angular.extend({}, d), obj$1.f = 1, obj$1 );
			obj.e = e;
		`
	},

	{
		description: 'transpiles rest properties',
		input: `var {a, ...b} = c`,
		output: `function objectWithoutProperties (obj, exclude) { var target = {}; for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && exclude.indexOf(k) === -1) target[k] = obj[k]; return target; }
var a = c.a;
var rest = objectWithoutProperties( c, ["a"] );
var b = rest;`
	},

	{
		description: 'transpiles rest properties in assignments',
		input: `({a, ...b} = c);`,
		output: `function objectWithoutProperties (obj, exclude) { var target = {}; for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && exclude.indexOf(k) === -1) target[k] = obj[k]; return target; }

var assign, rest;
((assign = c, a = assign.a, rest = objectWithoutProperties( assign, ["a"] ), b = rest));`
	},

	{
		description: 'transpiles rest properties in arguments',
		input: `
			"use strict";
			function objectWithoutProperties({x, ...y}) {}`,
		output: `
			"use strict";
			function objectWithoutProperties$1 (obj, exclude) { var target = {}; for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && exclude.indexOf(k) === -1) target[k] = obj[k]; return target; }
function objectWithoutProperties(ref) {
				var x = ref.x;
				var rest = objectWithoutProperties$1( ref, ["x"] );
				var y = rest;
}`
	},

	{
		description: 'transpiles rest properties in arrow function arguments',
		input: `(({x, ...y}) => {})`,
		output: `function objectWithoutProperties (obj, exclude) { var target = {}; for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && exclude.indexOf(k) === -1) target[k] = obj[k]; return target; }
(function (ref) {
	var x = ref.x;
	var rest = objectWithoutProperties( ref, ["x"] );
	var y = rest;
})`
	},

	{
	description: 'transpiles rest properties in for loop heads',
	input: `for( var {a, ...b} = c;; ) {}`,
	output: `function objectWithoutProperties (obj, exclude) { var target = {}; for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && exclude.indexOf(k) === -1) target[k] = obj[k]; return target; }
for( var a = c.a, rest = objectWithoutProperties( c, ["a"] ), b = rest;; ) {}`
	},

	{
	description: 'transpiles trivial rest properties in for loop heads',
	input: `for( var {...b} = c;; ) {}`,
	output: `function objectWithoutProperties (obj, exclude) { var target = {}; for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && exclude.indexOf(k) === -1) target[k] = obj[k]; return target; }
for( var rest = objectWithoutProperties( c, [] ), b = rest;; ) {}`
	},

	{
		description: 'inlines object spread with one object',
		input: `var obj = {...{a: 1}};`,
		output: `var obj = {a: 1};`
	},

	{
		description: 'inlines object spread with two objects',
		input: `var obj = {...{a: 1}, ...{b: 2}};`,
		output: `var obj = {a: 1, b: 2};`
	},

	{
		description: 'inlines object spread with regular keys in between',
		input: `var obj = { ...{a: 1}, b: 2, c: 3 };`,
		output: `var obj = { a: 1, b: 2, c: 3 };`
	},

	{
		description: 'inlines object spread mixed',
		input: `var obj = { ...{a: 1}, b: 2, ...{c: 3}, e};`,
		output: `var obj = { a: 1, b: 2, c: 3, e: e};`
	},

	{
		description: 'inlines object spread very mixed',
		options: {
			objectAssign: 'Object.assign'
		},
		input: `
			var obj = { ...{a: 1}, b: 2, ...c, e};
		`,
		output: `
			var obj = Object.assign({ a: 1, b: 2}, c);
			obj.e = e;
		`
	},

	{
		description: 'inlines object spread without extraneous trailing commas',
		options: {
			objectAssign: 'Object.assign'
		},
		input: `
			var obj = { ...{a: 1,}, b: 2, ...{c: 3,}, ...d, e, ...{f: 6,},};
			obj = { a: 1, b: 2, };
			obj = { a: 1, ...{b: 2} };
			obj = { a: 1, ...{b: 2,} };
			obj = { a: 1, ...{b: 2}, };
			obj = { a: 1, ...{b: 2,}, };
		`,
		output: `
			var obj = Object.assign({ a: 1, b: 2, c: 3}, d);
			obj.e = e;
			obj.f = 6;
			obj = { a: 1, b: 2, };
			obj = { a: 1, b: 2 };
			obj = { a: 1, b: 2 };
			obj = { a: 1, b: 2, };
			obj = { a: 1, b: 2, };
		`
	},

	{
		description: 'does not inline object spread with getters',
		options: {
			objectAssign: 'Object.assign'
		},
		input: `
			var obj = { a: 1, ...{ b: 2, get c() { return 3; } }, d: 4 };
		`,
		output: `
			var obj = Object.assign({ a: 1 }, { b: 2, get c() { return 3; } });
			obj.d = 4;
		`
	},

	{
		description: 'does not inline object spread with getters when mixed',
		options: {
			objectAssign: 'Object.assign'
		},
		input: `
			var obj = { a: 1, [ x ]: 2, ...{ get c() { return 3; } }, ...d, e };
		`,
		output: `
			var obj = { a: 1 };
			obj[ x ] = 2;
			Object.assign(obj, { get c() { return 3; } }, d);
			obj.e = e;
		`
	}
];
