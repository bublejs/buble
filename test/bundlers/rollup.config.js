import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: __dirname + '/index.js',
  output: {format: 'es'},
  plugins: [ commonjs(), resolve() ],
};
