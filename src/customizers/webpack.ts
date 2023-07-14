import type { Configuration } from 'webpack'
import { merge } from 'lodash'
// import fs from 'node:fs'
import { getWebpackPlugin, getType } from '../utils'

/**
 * For debugging,write config to webpack.config.json file
 */
export const writeConfigForDebug =
  (filename: string) => (config: Configuration) => {
    if (!filename) {
      throw new Error('Function: writeConfigForDebug must has a parameter')
    }
    const fs = require('node:fs')
    const path = require('node:path')
    fs.writeFileSync(
      path.join(process.cwd(), filename),
      JSON.stringify(
        config,
        (key, val) => {
          if (Object.prototype.toString.call(val) === '[object RegExp]') {
            return val.toString()
          }
          return val
        },
        2
      )
    )
    return config
  }

/**
 * modify `DefinePlugin` config
 * @param {Object} value Environment object
 * */
export const addDefinitionsEnvValue =
  (value: Record<string, string>) => (config: Configuration) => {
    const plugin = getWebpackPlugin(config.plugins, 'DefinePlugin')
    if (!plugin) throw new Error("DefinePlugin don't exist!")
    const processEnv = plugin.definitions['process.env'] || {}
    plugin.definitions['process.env'] = {
      ...processEnv,
      ...value
    }
    return config
  }

/**
 * 修改`html-webpack-plugin` 插件配置
 * @param value 配置
 * @param {number} [id] - HtmlWebpackPlugin插件数组中的位置
 * @returns a function that takes in the original config as the first argument (and optionally a context object) and returns the new config
 * @since 0.2.5
 * @version 1.0.2
 */
export const addHtmlWebpackPlugin =
  (value: any, id?: number) => (config: Configuration) => {
    const plugin = getWebpackPlugin(config.plugins, 'HtmlWebpackPlugin', id)
    if (!plugin) throw new Error("HtmlWebpackPlugin don't exist!")
    merge(plugin, value)
    return config
  }

/**
 * 支持修改 `interpolate-html-plugin` 插件的配置
 * @param value `interpolate-html-plugin` 配置
 * @see {@link https://github.com/egoist/interpolate-html-plugin#readme}
 * @returns a function that takes in the original config as the first argument (and optionally a context object) and returns the new config
 * @since 0.2.5
 * @version 1.0.2
 */
export const addInterpolateHtmlPlugin =
  (value: any) => (config: Configuration) => {
    const plugin = getWebpackPlugin(config.plugins, 'InterpolateHtmlPlugin')
    if (!plugin) throw new Error("InterpolateHtmlPlugin don't exist!")
    merge(plugin.replacements, value)

    return config
  }

/** modify output config */
export const modifyOutputConfig =
  (modify: Record<string, string>, removeSet: string[] = []) =>
    (config: Configuration) => {
      if (getType(modify) !== 'object') {
        throw new Error(
          "Function: modifyOutputConfig's first parameter must be object!"
        )
      }
      if (getType(removeSet) !== 'array') {
        throw new Error(
          "Function: modifyOutputConfig's second parameter must be array!"
        )
      }
      if (typeof config.output !== 'object') return config
      Object.assign(config.output, modify)
      if (!config.output) return config
      for (const key of removeSet) {
        delete (config.output as Record<string, any>)[key]
      }
      return config
    }

/** add split chunk plugin  */
export const addSplitChunksPlugin =
  (value: Record<string, any>) => (config: Configuration) => {
    const splitChunks = config.optimization?.splitChunks || {}
    Object.assign(splitChunks, value)
    config.optimization!.splitChunks = splitChunks
    return config
  }
