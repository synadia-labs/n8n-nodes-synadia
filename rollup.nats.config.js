const typescript = require('@rollup/plugin-typescript');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');

module.exports = {
  input: 'src/bundled/nats-wrapper.ts',
  output: {
    file: 'src/bundled/nats-bundled.js',
    format: 'cjs',
    exports: 'named',
  },
  external: [], // Bundle everything
  plugins: [
    resolve({
      preferBuiltins: true,
      browser: false,
    }),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.rollup.json',
      declaration: false,
    }),
  ],
};