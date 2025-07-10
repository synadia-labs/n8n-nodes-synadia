import esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['bundled/nats-bundle-entry.ts'],
  bundle: true,
  outfile: 'bundled/nats-bundled.js',
  platform: 'node',
  target: 'node16',
  format: 'cjs',
  sourcemap: false,
  minify: false,
  keepNames: true,
  banner: {
    js: '/* Bundled NATS.js client with Node.js TCP transport for n8n-nodes-synadia */',
  },
  external: [
    'n8n-workflow',
    'n8n-core',
  ],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  alias: {
    // Bundle with TCP transport for Node.js
  },
});