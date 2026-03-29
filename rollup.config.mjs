import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';

const babelPlugin = babel({ babelHelpers: 'bundled', extensions: ['.js', '.jsx'] });

export default [
  // Pure core — no DOM, no React (safe to import in any environment)
  {
    input: 'src/core.js',
    external: [],
    plugins: [resolve(), babelPlugin],
    output: [
      { file: 'dist/core.esm.js', format: 'esm' },
      { file: 'dist/core.cjs.js', format: 'cjs', exports: 'named' },
    ],
  },
  // Vanilla JS (includes DynamicFont class + core re-exports)
  {
    input: 'src/index.js',
    external: [],
    plugins: [resolve(), babelPlugin],
    output: [
      { file: 'dist/index.esm.js', format: 'esm' },
      { file: 'dist/index.cjs.js', format: 'cjs', exports: 'named' },
    ],
  },
  // React (includes components, useDynamicFont hook + core re-exports)
  {
    input: 'src/react/index.js',
    external: ['react'],
    plugins: [resolve(), babelPlugin],
    output: [
      { file: 'dist/react.esm.js', format: 'esm', globals: { react: 'React' } },
      { file: 'dist/react.cjs.js', format: 'cjs', exports: 'named', globals: { react: 'React' } },
    ],
  },
];
