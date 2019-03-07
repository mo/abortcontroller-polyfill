import babel from 'rollup-plugin-babel';

const plugins = [
  babel({
    exclude: 'node_modules/**'
  })
];

export default [{
  input: 'src/polyfill.js',
  output: {
    file: 'dist/umd-polyfill.js',
    format: 'umd'
  },
  plugins
},
{
  input: 'src/polyfill.js',
  output: {
    file: 'dist/polyfill-patch-fetch.js',
    format: 'umd'
  },
  plugins
},
{
  input: 'src/abortcontroller-polyfill.js',
  output: {
    file: 'dist/abortcontroller-polyfill-only.js',
    format: 'umd'
  },
  plugins
},
{
  input: 'src/ponyfill.js',
  output: {
    file: 'dist/cjs-ponyfill.js',
    format: 'cjs'
  },
  plugins
},
{
  input: 'src/abortcontroller.js',
  output: {
    file: 'dist/abortcontroller.js',
    format: 'cjs',
    exports: 'named'
  },
  plugins
}];
