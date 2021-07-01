import { nodeResolve } from '@rollup/plugin-node-resolve';
import mustache from 'rollup-plugin-mustache';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-import-css';
import { generateSW } from 'rollup-plugin-workbox';
// import html from '@rollup/plugin-html';
import html from '@web/rollup-plugin-html';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'app/index.html',
  output: {
    dir: 'dist',
    sourcemap: true
  },
  plugins: [
    mustache({
      include: 'app/templates/*.mustache'
    }),
    nodeResolve(), // tells Rollup how to find date-fns in node_modules
    css(),
    html({
      injectServiceWorker: true,
      serviceWorkerPath: './app/js/service-worker.js'
    }),
    commonjs(), // converts date-fns to ES modules
    production && terser() // minify, but only in production
    // generateSW({ clientsClaim: true, skipWaiting: true })
  ]
};
