import type { Configuration } from "webpack"
import fs from "node:fs"
import { getWebpackPlugin, getType } from "../utils"

/**
 * For debugging,write config to webpack.config.json file
 */
export const writeConfigForDebug =
  (filename: string) => (config: Configuration) => {
    if (!filename)
      throw new Error("Function: writeConfigForDebug must has a parameter")
    const fs = require("node:fs")
    const path = require("node:path")
    fs.writeFileSync(
      path.join(process.cwd(), filename),
      JSON.stringify(config, undefined, 2)
    )
    return config
  }

/**
 * modify `DefinePlugin` config
 * @param {Object} value Environment object
 * */
export const addDefinitionsEnvValue =
  (value: Record<string, string>) => (config: Configuration) => {
    const plugin = getWebpackPlugin(config.plugins, "DefinePlugin")
    if (!plugin) throw new Error("DefinePlugin don't exist!")
    const processEnv = plugin.definitions["process.env"] || {}
    plugin.definitions["process.env"] = {
      ...processEnv,
      ...value,
    }
    return config
  }

export const addHtmlWebpackPlugin =
  (value: any, id: number) => (config: Configuration) => {
    const plugin = getWebpackPlugin(config.plugins, "HtmlWebpackPlugin", id)
    if (!plugin) throw new Error("HtmlWebpackPlugin don't exist!")
    Object.assign(plugin, value)

    console.log(plugin, "htmlwebpackplugin")
    // const
    return config
  }

export const addInterpolateHtmlPlugin =
  (value: any) => (config: Configuration) => {
    const plugin = getWebpackPlugin(config.plugins, "InterpolateHtmlPlugin")
    if (!plugin) throw new Error("InterpolateHtmlPlugin don't exist!")
    // const { replacements = {}, ...rest } = value
    Object.assign(plugin?.replacements, value)
    // Object.assign(plugin, rest)

    return config
  }

/** modify output config */
export const modifyOutputConfig =
  (modify: Record<string, string>, removeSet: string[] = []) =>
  (config: Configuration) => {
    if (getType(modify) !== "object")
      throw new Error(
        "Function: modifyOutputConfig's first parameter must be object!"
      )
    if (getType(removeSet) !== "array")
      throw new Error(
        `Function: modifyOutputConfig\'s second parameter must be array!`
      )
    if (typeof config.output !== "object") return config
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
    let splitChunks = config.optimization?.splitChunks || {}
    Object.assign(splitChunks, value)
    config.optimization!.splitChunks = splitChunks
    return config
  }
