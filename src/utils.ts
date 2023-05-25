import path from "node:path"
import fs from "node:fs"
import type { Configuration } from "webpack"

const appDirectory = fs.realpathSync(process.cwd())

/** load file */
export const resolveApp = (relativePath: string) =>
  path.resolve(appDirectory, relativePath)

/** look for webpack plugin that you expect */
export const getWebpackPlugin = (
  plugins: Configuration["plugins"] = [],
  pluginName: string,
  id: number = 0
) => {
  if (id === 0) {
    return plugins.find((plugin) => plugin.constructor.name === pluginName)
  }
  const sets = plugins.filter(
    (plugin) => plugin.constructor.name === pluginName
  )
  if (id > sets.length) throw new Error("Function getWebpackPlugin")
  return sets[id]
}

/** get target type */
export const getType = (target: unknown) => {
  return Object.prototype.toString.call(target).slice(8, -1).toLocaleLowerCase()
}

/**
 *
 * @param haystack
 * @param needle inserted position
 * @param insertedString
 * @returns {string} concatenated string
 */
export const insertStringAfter = (
  haystack: string,
  needle: string,
  insertedString: string
) => {
  if (!insertedString) return haystack
  const needleString = String(needle)
  const index = haystack.indexOf(needleString)
  if (index === -1) {
    return haystack
  }
  const endIndex = index + needleString.length
  return haystack.slice(0, endIndex) + insertedString + haystack.slice(endIndex)
}

/**
 *
 * @param haystack
 * @param needle inserted position
 * @param insertedString
 * @returns {string} concatenated string
 */
export const insertStringBefore = (
  haystack: string,
  needle: string,
  insertedString: string
) => {
  if (!insertedString) return haystack
  const needleString = String(needle)
  const index = haystack.indexOf(needleString)
  if (index === -1) {
    return haystack
  }
  return haystack.slice(0, index) + insertedString + haystack.slice(index)
}
