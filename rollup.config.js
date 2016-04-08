import buble from 'rollup-plugin-buble';

export default {
	entry: 'src/index.js',
	moduleName: 'buble',
	plugins: [ buble() ],
	sourceMap: true
};
