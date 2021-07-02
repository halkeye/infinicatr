import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import mustache from './rollup-plugin-fake-mustache';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import manifestJson from './rollup-plugin-manifest-json'; // 'rollup-plugin-manifest-json';
import html from '@web/rollup-plugin-html';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = false; // !process.env.ROLLUP_WATCH;

export default [
  {
    input: 'app/js/app.js',
    output: {
      file: 'dist/bundle.es5.js',
      format: 'esm',
      plugins: [
      ]
    },
    plugins: [
      mustache({ include: 'app/templates/*.mustache' }),
      postcss({ plugins: [] }),
      nodeResolve(), // tells Rollup how to find date-fns in node_modules
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        babelrc: false,
        exclude: [/\/core-js\//],
        presets: [
          // ['@babel/preset-env', { targets: '> 0.25%, not dead', modules: 'umd', forceAllTransforms: true }]
          [
            '@babel/preset-env',
            {
              corejs: 3,
              useBuiltIns: 'usage',
              modules: false,
              targets: '> 1%, IE 11, not op_mini all, not dead'
            }
          ]
        ],
        plugins: [
          ['@babel/plugin-transform-object-assign']
        ]
      }),
      production && terser()
    ]
  },
  {
    input: 'app/js/app.js',
    output: { file: 'dist/bundle.esm.js', format: 'esm' },
    plugins: [
      commonjs(), // converts date-fns to ES modules
      mustache({
        include: 'app/templates/*.mustache'
      }),
      nodeResolve(), // tells Rollup how to find date-fns in node_modules
      postcss({
        plugins: []
      }),
      production && terser() // minify, but only in production
    ]
  },
  {
    input: 'app/js/service-worker',
    output: {
      file: 'dist/sw.js',
      sourcemap: true
    },
    plugins: [
      production && terser() // minify, but only in production
    ]
  },
  {
    input: 'app/index.html',
    output: { dir: 'dist' },
    plugins: [
      html({
        serviceWorkerPath: '/sw.js',
        injectServiceWorker: production,
        transformHtml: [html => {
          html = html.replace('assets/manifest.json', 'manifest.json');
          return html;
        }]
      })
    ]
  },
  {
    input: 'app/manifest.json',
    output: { dir: 'dist' },
    plugins: [
      manifestJson({
        input: 'app/manifest.json', // Required
        minify: true,
        manifest: {
          icons: [32, 60, 90, 120, 128, 144, 152, 256, 512].map(size => ({ src: `./app/icons/icon-${size}.png`, sizes: `${size}x${size}`, type: 'image/png' }))
        }
      })
    ]
  }
];
