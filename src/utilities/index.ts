import fs, { PathLike } from "node:fs"
import { resolveApp } from "@/utils"
/**
* read all env config file
* */
export const readAllDotenvFiles = (environments: string[], id = '') => {
  const path = require('node:path')
  const dotenvCore = resolveApp('.env')
  // const dotenvFiles = environments.flat()

  const readDotenvFiles = (environment: string, id: string) => {
    const dotenvFiles = [
      `${dotenvCore}.${environment}.local`,
      process.env.NODE_ENV !== 'test' && `${dotenvCore}.local`,
      `${dotenvCore}.${environment}`,
      dotenvCore
    ].filter(Boolean)

    let dotenvData: Record<string, any> = { raw: {} }

    dotenvFiles.forEach(dotenvFile => {
      if (fs.existsSync(dotenvFile as PathLike)) {
        const { parsed } = require('dotenv').config({ path: dotenvFile })
        Object.assign(dotenvData.raw, parsed)
      }
    })

    if (id) {
      let mark = dotenvData.raw[`${id}_KEY`] || environment
      delete dotenvData.raw[`${id}_KEY`]
      // dotenvData[id] = { [mark]: {} }
      dotenvData[mark] = {}


      for (const [key, val] of Object.entries(dotenvData.raw)) {
        if (key.startsWith(id)) dotenvData[mark][key] = val
      }
    }

    return dotenvData
    // return { [environment]: dotenvData }
  }

  let allDotenvData: Record<string, any> = { raw: {} }

  // let _id = id.startsWith('__') ? `${id}_${id.replaceAll('_', '')}` : id
  if (id) allDotenvData[id] = {}


  environments.forEach(environment => {
    const { raw, ...rest } = readDotenvFiles(environment, id)

    Object.assign(allDotenvData.raw, { [environment]: raw })

    id && Object.assign(allDotenvData[id], rest)

  })


  return JSON.parse(JSON.stringify(allDotenvData), function(key, val) {
    if (key.startsWith('__') && key !== id) {
      this[key.replace(/^__[^_]+_/, '')] = val
    } else {
      return val
    }
    // if (!key.startsWith('__')) return val
    // const _key = key.replace(/^__[^_]+_/, '')
    // if(!_key) return val
    // this[_key] = val
    // if (key.startsWith('__')) {
    //   this[key.replace(`${id}_`, '')] = val 
    // }
    // return val

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
