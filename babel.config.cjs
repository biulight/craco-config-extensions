// export default function (api) {
//   api.cache.using(() => process.env.NODE_ENV)
//   if (api.env("test")) {
//     return {
//       presets: [
//         ["@babel/preset-env", { targets: { node: "current" } }],
//         "@babel/preset-typescript",
//       ],
//       plugins: [["babel-plugin-transform-import-meta", { module: "ES6" }]],
//     }
//   }

//   return {
//     presets: [
//       ["@babel/preset-env", { targets: { node: "current" } }],
//       "@babel/preset-typescript",
//     ]
//   }
// }
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript'
  ],
  // todo 测试下环境变量配置plugin是否可用
  // test: {
  //   plugins: [["babel-plugin-transform-import-meta", { module: "ES6" }]],
  // },
  overrides: [
    {
      test: 'src/loadRobot',
      presets: [
        ['@babel/preset-env', { useBuiltIns: 'usage', corejs: '3.22' }],
      ]
    },
    {
      test: '__test__',
      plugins: [['babel-plugin-transform-import-meta', { module: 'ES6' }]]
    }
  ]
}
