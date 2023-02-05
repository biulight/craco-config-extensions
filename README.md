# craco-config-extensions

> 用于快速配置 craco.config.js 文件
> 支持基于访问域名动态映射静态资源加载域名

## Requirements

基于`webpack5`和`@craco/craco@7.0.0`

## Install

```bash

npm install craco-config-extensions --save-dev

```

```bash
yarn add --dev craco-config-extensions
```

## Usage

### 功能


#### `modifyOutputConfig`

修改`webpack`的`output`配置


#### Plugin


#### 工具函数

##### `override`

高阶函数，支持配置函数链式调用
##### `stringifyVal`

将对象中value转换成JSON字符串


### 示例

#### `override`函数

```js
const { override } = require("craco-config-extensions")

module.exports = {
  webpack: {
    configure: override(func1, func2),
  },
}
```

#### 在 html 模板 head 标签里注入资源

```js
const { HtmlWebpackInjectHead } = require("craco-config-extensions")

module.exports = {
  webpack: {
    plugins: {
      add: [
        new HtmlWebpackInjectHead({
          content: "<script src='preload.worker.js'></script>" /* 插入的内容 */,
          position:
            "start" /* start（默认值）: 在head顶部插入; end: 在head底部插入*/,
        }),
      ],
    },
  },
}
```

#### 读取指定`.env`文件中指定前缀配置

> 文件读取规则等价于`create-react-app`

.env.production

```
__DYNAMIC_KEY=production.html.example.com
__DYNAMIC_ENV=PRD
__DYNAMIC_DOMAIN_SERVER=production.server.example.com
__DYNAMIC_STATIC_DOMAIN=production.cdn.example.com

```

```js
const { readAllDotenvFiles } = require("craco-config-extensions")

// 读取.env.production, .env.develpment, .env.stg 等文件
const { __DYNAMIC: DYNAMIC_ENV } = readAllDotenvFiles(
  ["production", "development", "stg"],
  "__DYNSMIC"
)
/*
DYNAMIC_ENV:

 */
```

##### 注意事项

- `__DYNAMIC_KEY`会被忽略，只用来指定 html 域名
- `__DYNAMIC_STATIC_DOMAIN`: 当与`loadRobot`类结合使用时，会自动创建`base`标签，并把 href 指向它的值

#### 动态映射域名

```js
import CracoEnv from "craco-config-extensions/dist/loadRobot"

// 创建
const envInstance = CracoEnv.createInstance({
  "production.html.example.com": {
    ENV: "PRD",
    DOMAIN_SERVER: "production.server.example.com",
    // STATIC_DOMAIN: "production.cdn.example.com",
  },
  localhost: {
    ENV: "DEV",
    DOMAIN_SERVER: "/api",
    // STATIC_DOMAIN: "/",
  },
})

// 使用
const server = envInstance.DOMAIN_SERVER
```

#### 动态加载指定域名静态资源

> 依托`html`文件域名，动态加载指定 cdn 静态资源

1. 使用 loadRobot 类的 umd 文件,提供全局变量`_BIU_LOAD_ENV`

```js
// 编辑craco.config.js文件
const CopyWebpackPlugin = require("copy-webpack-plugin")
const { HtmlWebpackInjectHead } = require("craco-config-extensions")

module.exports = {
  webpack: {
    plugins: {
      add: [
        // 复制文件到打包产物目录
        new CopyWebpackPlugin({
          patterns: [
            {
              from: "node_modules/craco-config-extensions/dist/loadRobot/index.umd.js",
              to: "preload.worker.js",
            },
          ],
        }),
        // 注入模板
        new HtmlWebpackInjectHead({
          content: "<script src='preload.worker.js'></script>" /* 插入的内容 */,
          position:
            "start" /* start（默认值）: 在head顶部插入; end: 在head底部插入*/,
        }),
      ],
    },
  },
}
```

2. 往`html`模版中注入变量

```js
module.exports = {
  webpack: {
    configure: override(
      addInterpolateHtmlPlugin({
        ...stringifyVal({ DYNAMIC_ENV }),
      })
    ),
  },
}
```

3. 修改`html`模板

```html
<!-- head头部加入实例化loadRobot逻辑 -->
<script>
  _BIU_LOAD_ENV.createInstance(JSON.parse("%DYNAMIC_ENV%"))
</script>
```
