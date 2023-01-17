import path from "node:path"
import fs, { PathLike } from "node:fs"
import { Configuration } from "webpack"

const appDirectory = fs.realpathSync(process.cwd())

/** load file */
export const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath)

/** look for webpack plugin that you expect */
export const getWebpackPlugin = (plugins: Configuration['plugins'] = [], pluginName: string, id: number = 0) => {
  if (id === 0) return plugins.find((plugin) => plugin.constructor.name === pluginName)
  // return plugins.filter((plugin) => plugin.constructor.name === pluginName)[id] || throw new Error("Function getWebpackPlugin")
  const sets = plugins.filter((plugin) => plugin.constructor.name === pluginName)
  if (id > sets.length) throw new Error('Function getWebpackPlugin')
  return sets[id]
}


/** get target type */
export const getType = (target:unknown) => {
  return Object.prototype.toString.call(target).slice(8, -1).toLocaleLowerCase()
}

