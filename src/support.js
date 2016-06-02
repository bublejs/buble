export const matrix = {
	chrome: {
				48: 0b10011110111111001111101011111001,
				49: 0b10011111111111001111111111111101,
				50: 0b10111111111111001111111111111101
	},
	firefox: {
				43: 0b10001111111011000001101110111001,
				44: 0b10001111111011000001101110111001,
				45: 0b10001111111011000001101110111001
	},
	safari: {
				 8: 0b10000000000000000000000000000000,
				 9: 0b10011110011011000000111010111100
	},
	ie: {
				 8: 0b00000000000000000000000000000000,
				 9: 0b10000000000000000000000000000000,
				10: 0b10000000000000000000000000000000,
				11: 0b10000000000000001110000011000000
	},
	edge: {
				12: 0b10111101101111000110100010111001,
				13: 0b10111111101111000111110010111101
	},
	node: {
		'0.10': 0b10000000001010000000000010000000,
		'0.12': 0b10000010001010000000100010001000,
				 4: 0b10011110001111001111110011111101,
				 5: 0b10011110001111001111110011111101,
				 6: 0b10111111111111001111111111111101
	}
};

export const features = [
	'arrow',
	'asyncAwait',
	'classes',
	'collections',
	'computedProperty',
	'conciseMethodProperty',
	'constLoop',
	'constRedef',
	'defaultParameter',
	'destructuring',
	'extendNatives',
	'forOf',
	'generator',
	'letConst',
	'letLoop',
	'letLoopScope',
	'moduleExport',
	'moduleImport',
	'numericLiteral',
	'objectProto',
	'objectSuper',
	'oldOctalLiteral',
	'parameterDestructuring',
	'spreadRest',
	'stickyRegExp',
	'symbol',
	'templateString',
	'unicodeEscape',
	'unicodeIdentifier',
	'unicodeRegExp',

	// ES2016
	'exponentiation',

	// additional transforms, not from
	// https://featuretests.io
	'reservedProperties'
];
