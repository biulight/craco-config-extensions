import { fileURLToPath } from 'node:url'
import alias from '@rollup/plugin-alias'
import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import babel from '@rollup/plugin-babel'

const isDevelopment = process.env.NODE_ENV === 'development'

export default [
  {
    input: 'src/loadRobot/index.ts',
    output: [
      {
        file: 'dist/loadRobot/index.esm.js',
        format: 'es'
      },
      {
        name: '_BIU_LOAD_ROBOT',
        file: 'dist/loadRobot/index.umd.js',
        format: 'umd',
        sourcemap: isDevelopment,
        minifyInternalExports: true
      }
    ],
    plugins: [
      replace({
        __DEV__: process.env.NODE_ENV !== 'production' // 本地link调试
      }),
      typescript(),
      babel({
        extensions: ['.js', '.ts'],
        exclude: ['node_modules'],
        babelHelpers: 'bundled'
      })
    ]
  },
  {
    input: 'src/main.ts',
    output: [
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        minifyInternalExports: true
      },
      {
        file: 'dist/index.esm.js',
        format: 'es'
      }
    ],
    plugins: [
      alias({
        entries: [
          // { find: "@", replacement: path.resolve(__dirname, './src') }
          { find: '@', replacement: fileURLToPath(new URL('src', import.meta.url)) }
        ]
      }),
      replace({
        // "__DEV__": process.env.NODE_ENV !== 'production'
        __DEV__: 'process.env.NODE_ENV !== \'production\''
      }),
      // resolve({
      //   customResolveOptions: {
      //     moduleDirectory: "node_modules"
      //   }
      // }),
      commonjs({
        include: 'node_modules'
      }),
      resolve(),
      typescript(),
      babel({
        extensions: ['.js', '.ts'],
        exclude: ['node_modules'],
        babelHelpers: 'bundled'
      })
    ],
    external: ['dotenv', 'html-webpack-plugin', '@craco/craco']
  }
]
