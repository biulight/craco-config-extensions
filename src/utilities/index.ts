export { default as HtmlWebpackInjectHead } from "./htmlWebpackInjectHead"

import fs, { PathLike } from "node:fs"
import { resolveApp } from "@/utils"
// import type { Configuration } from "webpack"

/**
 * read env config file.the rule like create-react-env
 */
export const readDotenvFiles = (environment: string, id?: string) => {
  const dotenvCore = resolveApp(".env")
  const dotenvFiles = [
    `${dotenvCore}.${environment}.local`,
    process.env.NODE_ENV !== "test" && `${dotenvCore}.local`,
    `${dotenvCore}.${environment}`,
    dotenvCore,
  ].filter(Boolean)

  let dotenvData: Record<string, any> = { raw: {} }

  dotenvFiles.forEach((dotenvFile) => {
    if (fs.existsSync(dotenvFile as PathLike)) {
      const { parsed } = require("dotenv").config({ path: dotenvFile })
      Object.assign(dotenvData.raw, parsed)
    }
  })

  if (id) {
    let mark = dotenvData.raw[`${id}_KEY`] || environment
    delete dotenvData.raw[`${id}_KEY`]
    dotenvData[mark] = {}

    for (const [key, val] of Object.entries(dotenvData.raw)) {
      if (key.startsWith(id)) dotenvData[mark][key] = val
    }
  }

  return dotenvData
}
/**
 * read all env config file
 */
export const readAllDotenvFiles = (environments: string[], id = "") => {
  // const dotenvCore = resolveApp(".env")
  // const dotenvFiles = environments.flat()

  // const readDotenvFiles = (environment: string, id: string) => {
  //   const dotenvFiles = [
  //     `${dotenvCore}.${environment}.local`,
  //     process.env.NODE_ENV !== "test" && `${dotenvCore}.local`,
  //     `${dotenvCore}.${environment}`,
  //     dotenvCore,
  //   ].filter(Boolean)

  //   let dotenvData: Record<string, any> = { raw: {} }

  //   dotenvFiles.forEach((dotenvFile) => {
  //     if (fs.existsSync(dotenvFile as PathLike)) {
  //       const { parsed } = require("dotenv").config({ path: dotenvFile })
  //       Object.assign(dotenvData.raw, parsed)
  //     }
  //   })

  //   if (id) {
  //     let mark = dotenvData.raw[`${id}_KEY`] || environment
  //     delete dotenvData.raw[`${id}_KEY`]
  //     dotenvData[mark] = {}

  //     for (const [key, val] of Object.entries(dotenvData.raw)) {
  //       if (key.startsWith(id)) dotenvData[mark][key] = val
  //     }
  //   }

  //   return dotenvData
  // }

  let allDotenvData: Record<string, any> = { raw: {} }

  if (id) allDotenvData[id] = {}

  environments.forEach((environment) => {
    const { raw, ...rest } = readDotenvFiles(environment, id)

    Object.assign(allDotenvData.raw, { [environment]: raw })

    id && Object.assign(allDotenvData[id], rest)
  })

  return JSON.parse(JSON.stringify(allDotenvData), function (key, val) {
    if (key.startsWith("__") && key !== id) {
      this[key.replace(/^__[^_]+_/, "")] = val
    } else {
      return val
    }
  })
}

/*
 * serialize value
 * */
export const stringifyVal = (target: Record<string, any>) => {
  return Object.keys(target).reduce((env, key) => {
    env[key] = JSON.stringify(target[key])
    return env
  }, {} as Record<string, string>)
}

/**
 * override configure by combine a list of function that used for modifing
 * */
export const override = (...plugins: (Function | false)[]) =>
  (plugins.filter((f) => f) as Function[]).reduce((pre, cur) => {
    return (webpackConfig: any, extra = {}) => {
      return cur(pre(webpackConfig, extra), extra)
    }
  })
