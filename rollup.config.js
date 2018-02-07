import babel from 'rollup-plugin-babel';

const plugins = [
  babel({
    exclude: 'node_modules/**',
    plugins: ['external-helpers']
  })
];

export default [{
  input: 'src/polyfill.js',
  output: {
    name: 'AbortController-polyfill',
    file: 'dist/browser-polyfill.js',
    format: 'umd'
  },
  plugins
}, {
  input: 'src/abortcontroller.js',
  output: {
    file: 'dist/abortcontroller.js',
    format: 'cjs'
  },
  plugins
}, {
  input: 'src/patch-fetch.js',
  output: {
    file: 'dist/patch-fetch.js',
    format: 'cjs'
  },
  plugins
}];