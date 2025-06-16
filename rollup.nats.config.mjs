import { defineConfig } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default defineConfig({
  input: 'src/bundled/nats-wrapper.ts',
  output: {
    file: 'src/bundled/nats-bundled.js',
    format: 'cjs',
    exports: 'named',
    banner: '/* Bundled NATS.js client with WebSocket support for n8n-nodes-synadia */',
  },
  external: [],
  plugins: [
    replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify('production'),
        'global.WebSocket': 'WebSocket',
        'global.crypto': 'crypto',
      },
    }),
    typescript({
      tsconfig: false,
      module: 'ESNext',
      target: 'ES2019',
      lib: ['ES2019'],
      moduleResolution: 'node',
      allowSyntheticDefaultImports: true,
      sourceMap: false,
      inlineSources: false,
    }),
    nodeResolve({
      browser: false,
      preferBuiltins: true,
      exportConditions: ['node'],
      extensions: ['.js', '.mjs', '.ts'],
    }),
    commonjs({
      ignoreDynamicRequires: true,
      extensions: ['.js', '.mjs'],
    }),
    json(),
    terser({
      keep_fnames: true,
      mangle: false,
    }),
  ],
});