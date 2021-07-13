var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var child_process = require('child_process');
var assert = require('assert');
var glob = require('glob');
var SourceMapConsumer = require('source-map').SourceMapConsumer;
var getLocation = require('./utils/getLocation.js');
var buble = require('..');

require('source-map-support').install();
require('console-group').install();

function equal(a, b) {
	assert.equal(showInvisibles(a), showInvisibles(b));
}

function showInvisibles(str) {
	return str
		.replace(/^ +/gm, spaces => repeat('•', spaces.length))
		.replace(/ +$/gm, spaces => repeat('•', spaces.length))
		.replace(/^\t+/gm, tabs => repeat('›   ', tabs.length))
		.replace(/\t+$/gm, tabs => repeat('›   ', tabs.length));
}

function repeat(str, times) {
	var result = '';
	while (times--) result += str;
	return result;
}

const subsetIndex = process.argv.indexOf('--subset');
const subset = ~subsetIndex
	? process.argv[subsetIndex + 1].split(',').map(file => `${file}.js`)
	: null;
const subsetFilter = subset ? file => ~subset.indexOf(file) : () => true;

describe('buble', () => {
	fs
		.readdirSync('test/samples')
		.filter(subsetFilter)
		.forEach(file => {
			if (!/\.js$/.test(file)) return; // avoid vim .js.swp files
			var samples = require('./samples/' + file);

			describe(path.basename(file), () => {
				samples.forEach(sample => {
					(sample.solo ? it.only : sample.skip ? it.skip : it)(
						sample.description,
						() => {
							if (sample.error) {
								assert.throws(() => {
									buble.transform(sample.input, sample.options);
								}, sample.error);
							} else {
								equal(
									buble.transform(sample.input, sample.options).code,
									sample.output
								);
							}
						}
					);
				});
			});
		});

});
