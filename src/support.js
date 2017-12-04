export const matrix = {
	chrome: {
		    48: 0b01001011100111101101,
		    49: 0b01001111100111111111,
		    50: 0b01011111100111111111,
		    51: 0b01011111100111111111,
		    52: 0b01111111100111111111
	},
	firefox: {
		    43: 0b01001111100011011101,
		    44: 0b01001111100111011101,
		    45: 0b01001111100111011111,
		    46: 0b01011111100111011111,
		    47: 0b01011111100111111111,
		    48: 0b01011111100111111111
	},
	safari: {
		     8: 0b01000000000000000000,
		     9: 0b01001001100001101110
	},
	ie: {
		     8: 0b00000000000000000000,
		     9: 0b01000000000000000000,
		    10: 0b01000000000000000000,
		    11: 0b01000000000100000000
	},
	edge: {
		    12: 0b01011010100101001101,
		    13: 0b01011110100111001111
	},
	node: {
		'0.10': 0b01000000000000000000,
		'0.12': 0b01000000000001000000,
		     4: 0b01001000100111001111,
		     5: 0b01001000100111001111,
		     6: 0b01011111100111111111
	}
};

export const features = [
	'arrow',
	'classes',
	'computedProperty',
	'conciseMethodProperty',
	'defaultParameter',
	'destructuring',
	'forOf',
	'generator',
	'letConst',
	'moduleExport',
	'moduleImport',
	'numericLiteral',
	'parameterDestructuring',
	'spreadRest',
	'stickyRegExp',
	'templateString',
	'unicodeRegExp',

	// ES2016
	'exponentiation',

	// additional transforms, not from
	// https://featuretests.io
	'reservedProperties',

	'trailingFunctionCommas'
];
