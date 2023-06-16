import type { Configuration as WebpackConfig } from 'webpack'
import { loaderByName, getLoader, addAfterLoader } from '@craco/craco'

/**
 * @description sass-resources-loader的craco版本插件
 * @exports sass-resources-loader
 * @version 1.0.1
 * @see {@link https://github.com/shakacode/sass-resources-loader#readme}
 * @example <caption>craco.config.js</caption>
 * const { sassResourcesLoader } = '@biulight/craco-config-extensions'
 *
 * module.exports = {
 *   plugins: [
 *     {
 *       plugin: sassResourcesLoader,
 *       options: {
 *         resources: 'example/a.scss'
 *       }
 *     }
 *   ]
 * }
 */
export default {
  overrideWebpackConfig: ({
    webpackConfig,
    pluginOptions
  }: {
    webpackConfig: WebpackConfig
    pluginOptions: {
      resources: string | string[]
      hoistUseStatements?: boolean
    }
  }) => {
    const { isFound } = getLoader(webpackConfig, loaderByName('sass-loader'))
    if (isFound) {
      addAfterLoader(webpackConfig, loaderByName('sass-loader'), {
        loader: 'sass-resources-loader',
        options: pluginOptions
      })
    }
    return webpackConfig
  }
}
