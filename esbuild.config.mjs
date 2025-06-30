import esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/bundled/nats-bundle-entry.ts'],
  bundle: true,
  outfile: 'src/bundled/nats-bundled.js',
  platform: 'node',
  target: 'node16',
  format: 'cjs',
  sourcemap: false,
  minify: false,
  keepNames: true,
  banner: {
    js: '/* Bundled NATS.js client with WebSocket support for n8n-nodes-synadia */',
  },
  external: [
    'n8n-workflow',
    'n8n-core',
  ],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  alias: {
    // Ensure we use the WebSocket-enabled version
  },
});