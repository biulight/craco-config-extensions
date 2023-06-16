# @biulight/craco-config-extensions

> 用于快速配置 craco.config.js 文件，支持基于访问域名动态映射静态资源加载域名

## Requirements

基于`webpack5`和`@craco/craco@7.0.0`

## Install

```bash

npm install @biulight/craco-config-extensions --save-dev

```

```bash
yarn add --dev @biulight/craco-config-extensions
```

## Usage

### 功能

#### 钩子函数

> 修改`webpack`配置的钩子函数


##### `modifyOutputConfig`

修改`webpack`的`output`配置

##### `addInterpolateHtmlPlugin`

修改`DefinePlugin`插件

##### `addInterpolateHtmlPlugin`

修改`create-react-app`内置的`InterpolateHtmlPlugin`插件

##### `addSplitChunksPlugin`

修改`webpack`的`Optimization.splitChunks`


#### Plugin

##### `HtmlWebpackInjectHead`

##### `HtmlWebpackMixinRobot`

#### cracoPlugin

##### `sassResourcesLoader`

> `sass-resources-loader` 的 `craco` 版本

```js
const { sassResourcesLoader } = require(`@biulight/craco-config-extensions`)

module.exports = {
  plugins: [
    {
      plugin: sassResourcesLoader,
      options: {
        resources: 'src/common/index.scss'
      }
    }
  ],
}
```

#### 工具函数

##### `override`

高阶函数，支持配置函数链式调用

##### `stringifyVal`

将对象中value转换成JSON字符串

##### `readAllDotenvFiles`

读取指定`.env`文件中指定前缀的变量

#### `LoadRobot`

```js

```


### 示例

#### `override`函数

```js
const { override } = require("@biulight/craco-config-extensions")

module.exports = {
  webpack: {
    configure: override(func1, func2),
  },
}
```

#### 在 html 模板 head 标签里注入资源

```js
const { HtmlWebpackInjectHead } = require("@biulight/craco-config-extensions")

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

> 文件读取规则等同于`create-react-app`脚手架中读取`.env`

.env.production

```
__DYNAMIC_KEY=production.html.example.com
__DYNAMIC_ENV=PRD
__DYNAMIC_DOMAIN_SERVER=production.server.example.com
__DYNAMIC_STATIC_DOMAIN=production.cdn.example.com

```

```js
const { readAllDotenvFiles } = require("@biulight/craco-config-extensions")

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

- `__DYNAMIC_KEY`会被忽略，只用来指定 html 文件资源域名
- `__DYNAMIC_STATIC_DOMAIN`: 当与`loadRobot`结合使用时，会自动创建`base`标签，并把 href 指向它的值

#### 动态映射域名

```js
import CracoEnv from "@biulight/craco-config-extensions/dist/loadRobot"

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

##### 方案一(旧方案)

1. 使用 loadRobot 类的 umd 文件,提供全局变量`_BIU_LOAD_ROBOT`

```js
// 编辑craco.config.js文件
const CopyWebpackPlugin = require("copy-webpack-plugin")
const { HtmlWebpackInjectHead } = require("@biulight/craco-config-extensions")

module.exports = {
  webpack: {
    plugins: {
      add: [
        // 复制文件到打包产物目录
        new CopyWebpackPlugin({
          patterns: [
            {
              from: "node_modules/@biulight/craco-config-extensions/dist/loadRobot/index.umd.js",
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
  _BIU_LOAD_ROBOT.createInstance(JSON.parse("%DYNAMIC_ENV%"))
</script>
```

4. 禁用`HtmlWebpackPlugin`插件将生成的 `webpack` 文件添加到资产

  - 修改`html-webpack-plugin`
  ```js
  // 编辑craco.config.js
  const HtmlWebpackPlugin = require("html-webpack-plugin")
  module.exports = {
    webpack: {
      plugins: {
        add: [
          new HtmlWebpackPlugin({
            ...
            inject: false, // disable automatic injections
          })
        ]
      }
    }
  }
  ```

  - 修改`html`模板，动态加载资源

  ```html
  <head>
    <!-- 插入如下代码 -->
    <%= "<script>" %>
      _BIU_LOAD_ROBOT.load([..."<%= htmlWebpackPlugin.files.css %>,<%= htmlWebpackPlugin.files.js %>".split(",")])
    <%= "</script>" %>
  </head>
  ```
  `inject: false` 示例，参考[html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin/tree/main/examples/custom-insertion-position)
  模板语法参考[EJS](https://ejs.co/#docs) 

##### 方案二（推荐）

> 使用`HtmlWebpackMixinRobot`插件

修改`craco.config.js` 插件

1. 禁用`HtmlWebpackPlugin`插件将生成的 `webpack` 文件添加到资产

  - 修改`html-webpack-plugin`
  ```js
  // 编辑craco.config.js
  const HtmlWebpackPlugin = require("html-webpack-plugin")
  module.exports = {
    webpack: {
      plugins: {
        add: [
          new HtmlWebpackPlugin({
            ...
            inject: false, // disable automatic injections
            scriptLoading: "blocking", // 动态创建`script`标签时，`defer` 属性不生效
          })
        ]
      }
    }
  }
  ```

2. 使用`HtmlWebpackMixinRobot`插件动态创建`base`标签并添加资产

```js
const CopyWebpackPlugin = require("copy-webpack-plugin")
const { HtmlWebpackMixinRobot } = require("@biulight/craco-config-extensions")

module.exports = {
  webpack: {
    plugins: {
      add: [
        // 复制文件到打包产物目录
        new CopyWebpackPlugin({
          patterns: [
            {
              from: "node_modules/@biulight/craco-config-extensions/dist/loadRobot/index.umd.js",
              to: "preload.worker.js",
            },
          ],
        }),
        // js创建标签，添加 `webpack` bundle 
        new HtmlWebpackMixinRobot(HtmlWebpackPlugin, { 
          env: JSON.stringify(DYNAMIC_ENV), // 可选，
          robotUrl: "preload.worker.js", // 可选, 当`robotUrl`和`env`同时存在，会实例化`loadRobot`类
          robotInstance: "BIU_BIU", // 可选，挂载在`global`对象上key，默认值`BIU_LIGHT_ROBOT_INSTANCE`
          force: true, // 可选,是否强制匹配pathname，默认值false(不匹配)
        })
      ]
    }
  }
}

```
`DYNAMIC_ENV`: 详见[读取指定`.env`文件中指定前缀配置](#读取指定`.env`文件中指定前缀配置)

