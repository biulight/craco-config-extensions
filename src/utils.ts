import path from 'node:path'
import fs from 'node:fs'
import type { WebpackPluginInstance } from 'webpack'

const appDirectory = fs.realpathSync(process.cwd())

/**
 * get the path of file
 * @param relativePath 文件的相对路径
 * @returns 文件的绝对路径
 * @ignore
 */
export const resolveApp = (relativePath: string) =>
  path.resolve(appDirectory, relativePath)

/**
 * look for webpack plugin that you expect
 * @param plugins {Plugin[]} 已注册的webpack插件集合
 * @param pluginName 插件名
 * @param id 匹配插件名的所有插件的可选下标
 * @returns 精准匹配的插件
 * @ignore
 */
export const getWebpackPlugin = (
  plugins: WebpackPluginInstance[] = [],
  pluginName: string,
  id: number = 0
) => {
  if (id === 0) {
    return plugins.find((plugin) => plugin.constructor.name === pluginName)
  }
  const sets = plugins.filter(
    (plugin) => plugin.constructor.name === pluginName
  )
  if (id > sets.length) throw new Error('Function getWebpackPlugin')
  return sets[id]
}

/**
 * get target type
 * @param target 目标
 * @returns 类型
 * @ignore
 */
export const getType = (target: unknown) => {
  return Object.prototype.toString.call(target).slice(8, -1).toLocaleLowerCase()
}

/**
 *
 * @param haystack
 * @param needle inserted position
 * @param insertedString
 * @returns {string} concatenated string
 * @ignore
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
 * @ignore
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
