export const matrix = {
	chrome: {
		    48: 0b01111011111100111110101111101,
		    49: 0b01111111111100111111111111111,
		    50: 0b11111111111100111111111111111
	},
	firefox: {
		    43: 0b00111111101100000110111011101,
		    44: 0b00111111101100000110111011101,
		    45: 0b00111111101100000110111011101
	},
	safari: {
		     8: 0b00000000000000000000000000000,
		     9: 0b01111001101100000011101011110
	},
	node: {
		'0.10': 0b00000000101000000000001000000,
		'0.12': 0b00001000101000000010001000100,
		     4: 0b01111000111100111111001111111,
		     5: 0b01111000111100111111001111111
	}
};

export const features = [
	'arrow',
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
	'unicodeRegExp'
];
