import { fileURLToPath } from "node:url"
import alias from "@rollup/plugin-alias"
import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import typescript from "@rollup/plugin-typescript"
import babel from "@rollup/plugin-babel"

// const path = require("path")
// const alias = require("@rollup/plugin-alias")
// const resolve = require("@rollup/plugin-node-resolve")
// const commonjs = require("@rollup/plugin-commonjs")
// const typescript = require("@rollup/plugin-typescript")
// const babel = require("@rollup/plugin-babel")


export default [
  {
    input: 'src/main.ts',
    output: [
      {
        file: 'dist/index.cjs.js',
        format: 'cjs',
        minifyInternalExports: true
      }
    ],
    plugins: [
      alias({
        entries: [
          // { find: "@", replacement: path.resolve(__dirname, './src') }
          { find: "@", replacement: fileURLToPath(new URL('src', import.meta.url)) }
        ]
      }),
      // resolve({
      //   customResolveOptions: {
      //     moduleDirectory: "node_modules"
      //   }
      // }),
      resolve(),
      commonjs({
        include: "node_modules"
      }),
      typescript(),
      babel({
        extensions: ['.js', '.ts'],
        exclude: ["node_modules"],
        "babelHelpers": "bundled"
      })
    ]

  }
]
