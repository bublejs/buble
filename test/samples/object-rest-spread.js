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
		description: 'transpiles object rest spread with regular keys in between',
		options: {
			objectAssign: 'Object.assign'
		},
		input: `var obj = { ...a, b: 1, c: 2 };`,
		output: `var obj = Object.assign({}, a, {b: 1, c: 2});`
	},

	{
		description: 'transpiles object rest spread mixed',
		options: {
			objectAssign: 'Object.assign'
		},
		input: `var obj = { ...a, b: 1, ...d, e};`,
		output: `var obj = Object.assign({}, a, {b: 1}, d, {e: e});`
	},

	{
		description: 'transpiles objects with rest spread with computed property (#144)',
		options: {
			objectAssign: 'Object.assign'
		},
		input: `
			var a0 = { [ x ] : true , ... y };
			var a1 = { [ w ] : 0 , [ x ] : true , ... y };
			var a2 = { v, [ w ] : 0, [ x ] : true , ... y };
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
			var a0 = Object.assign({},  y);
			a0[ x ] = true;
			var a1 = Object.assign({},  y);
			a1[ w ] = 0;
			a1[ x ] = true;
			var a2 = Object.assign({}, {v: v} , y);
			a2[ w ] = 0;
			a2[ x ] = true;
			var a3 = {};
			a3[ w ] = 0;
			a3[ x ] = true;
			var a4 = { y: y };
			a4[ w ] = 0;
			a4[ x ] = true;
			var a5 = Object.assign({}, {k : 9}, y);
			a5[ x ] = true;
			var a6 = Object.assign({}, y);
			a6[ x ] = true;
			var a7 = Object.assign({}, y);
			a7[ w ] = 0;
			a7[ x ] = true;
			var a8 = Object.assign({}, {k : 9}, y);
			a8[ x ] = true;
			var a9 = {};
			a9[ x ] = true;
			a9[ y ] = false;
			a9[ z ] = 9;
			var a10 = Object.assign({},  y, {p: p}, q);
			a10[ x ] = true;
			var a11 = { x: x , y: y };
			a11[c] = 9;
			var a12 = Object.assign({}, b, {d:4});
			a12[c] = 3;
		`
	},

	{
		description: 'transpiles inline objects with rest spread with computed property (#144)',
		options: {
			objectAssign: 'Object.assign'
		},
		input: `
			f0( { [ x ] : true , ... y } );
			f1( { [ w ] : 0 , [ x ] : true , ... y } );
			f2( { v, [ w ] : 0, [ x ] : true , ... y } );
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
			f0( ( obj = Object.assign({},  y), obj[ x ] = true, obj ) );
			var obj;
			f1( ( obj$1 = Object.assign({},  y), obj$1[ w ] = 0, obj$1[ x ] = true, obj$1 ) );
			var obj$1;
			f2( ( obj$2 = Object.assign({}, {v: v} , y), obj$2[ w ] = 0, obj$2[ x ] = true, obj$2 ) );
			var obj$2;
			f3( ( obj$3 = {}, obj$3[ w ] = 0, obj$3[ x ] = true, obj$3 ) );
			var obj$3;
			f4( ( obj$4 = { y: y }, obj$4[ w ] = 0, obj$4[ x ] = true, obj$4 ) );
			var obj$4;
			f5( ( obj$5 = Object.assign({}, {k : 9}, y), obj$5[ x ] = true, obj$5 ) );
			var obj$5;
			f6( ( obj$6 = Object.assign({}, y), obj$6[ x ] = true, obj$6 ) );
			var obj$6;
			f7( ( obj$7 = Object.assign({}, y), obj$7[ w ] = 0, obj$7[ x ] = true, obj$7 ) );
			var obj$7;
			f8( ( obj$8 = Object.assign({}, {k : 9}, y), obj$8[ x ] = true, obj$8 ) );
			var obj$8;
			f9( ( obj$9 = {}, obj$9[ x ] = true, obj$9[ y ] = false, obj$9[ z ] = 9, obj$9 ) );
			var obj$9;
			f10( ( obj$10 = Object.assign({},  y, {p: p}, q), obj$10[ x ] = true, obj$10 ) );
			var obj$10;
			f11( ( obj$11 = { x: x , y: y }, obj$11[c] = 9, obj$11 ) );
			var obj$11;
			f12(( obj$12 = Object.assign({}, b, {d:4}), obj$12[c] = 3, obj$12 ));
			var obj$12;
		`
	},

	{
		description: 'transpiles object rest spread nested',
		options: {
			objectAssign: 'Object.assign'
		},
		input: `var obj = { ...a, b: 1, dd: {...d, f: 1}, e};`,
		output: `var obj = Object.assign({}, a, {b: 1, dd: Object.assign({}, d, {f: 1}), e: e});`
	},

	{
		description: 'transpiles object rest spread deeply nested',
		options: {
			objectAssign: 'Object.assign'
		},
		input: `const c = { ...a, b: 1, dd: {...d, f: 1, gg: {h, ...g, ii: {...i}}}, e};`,
		output: `var c = Object.assign({}, a, {b: 1, dd: Object.assign({}, d, {f: 1, gg: Object.assign({}, {h: h}, g, {ii: Object.assign({}, i)})}), e: e});`
	},

	{
		description: 'transpiles object reset spread with custom Object.assign',
		options: {
			objectAssign: 'angular.extend'
		},
		input: `var obj = { ...a, b: 1, dd: {...d, f: 1}, e};`,
		output: `var obj = angular.extend({}, a, {b: 1, dd: angular.extend({}, d, {f: 1}), e: e});`
	}
];
