import fs from 'node:fs'
import path from 'node:path'
import type { Compiler } from 'webpack'
import type HtmlWebpackPlugin from 'html-webpack-plugin'
import type { HtmlTagObject } from 'html-webpack-plugin'

import { insertStringBefore, insertStringAfter, resolveApp } from '@/utils'
import { readAllDotenvFiles } from '@/utilities'

interface MixinRobotOpts {
  /** 挂载在window对象上的LoadRobot类的key */
  robot?: string
  /** 挂载在window对象上的robot实例key */
  robotInstance?: string
  /** LoadRobot函数的URL地址 */
  robotUrl?: string
  /** 环境对照的JSON字符串 */
  env?: string
  /** 开启pathname匹配规则 */
  force?: boolean
  /** 指定 .env 文件动态变量的前缀 */
  prefix?: string
}

/**
 * 自动注入 `LoadRobot` 实例的 `html-webpack-plugin` 插件
 */
export default class HtmlWebpackMixinRobot {
  options: MixinRobotOpts
  htmlWebpackPlugin: typeof HtmlWebpackPlugin
  PluginName: string

  /**
   *
   * @param htmlWebpackPlugin html-webpack-plugin构造器
   * @param options - 配置项
   * @param options.robot - LoadRobot类的全局变量
   * @param options.robotInstance - LoadRobot实例
   */
  constructor(
    htmlWebpackPlugin: typeof HtmlWebpackPlugin,
    options: MixinRobotOpts
  ) {
    this.htmlWebpackPlugin = htmlWebpackPlugin
    this.PluginName = 'HtmlWebpackMixinRobot'
    this.options = {
      robot: '_BIU_LOAD_ROBOT',
      robotInstance: 'BIU_LIGHT_ROBOT_INSTANCE',
      force: false,
      prefix: '__DYNAMIC',
      ...options
    }
  }

  static insertRobotFunc(
    html: string,
    tags: HtmlTagObject[],
    position: string,
    options: MixinRobotOpts
  ) {
    if (!tags.length) return html
    const formatTags = tags.map((tag) => {
      const { tagName, attributes } = tag
      return {
        tagName,
        attributes
      }
    })
    const str = `<script>${options.robot}.loadOrigin(${JSON.stringify(
      formatTags
    )}, "${position}")</script>`
    return insertStringBefore(html, `</${position}>`, str)
  }

  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap('HtmlWebpackMixinRobot', (compilation) => {
      this.htmlWebpackPlugin
        .getHooks(compilation)
        .afterTemplateExecution.tap('HtmlWebpackMixinRobot', (data) => {
          // const fs = require("node:fs")
          // const path = require("node:path")
          // fs.writeFileSync(
          //   path.join(process.cwd(), "__HtmlWebpackMixinRobot"),
          //   JSON.stringify(
          //     data,
          //     (key, val) => {
          //       if (Object.prototype.toString.call(val) === "[object RegExp]") {
          //         return val.toString()
          //       }
          //       return val
          //     },
          //     2
          //   )
          // )
          // 自动读取根目录下.env文件
          if (!this.options.env) {
            const dir = fs.readdirSync(resolveApp(''))
            const env = new Set<string>()
            dir.forEach((filename) => {
              if (!filename.startsWith('.env')) return
              const stats = fs.statSync(path.join(resolveApp(''), filename))
              if (!stats.isFile()) return
              filename.match(/^.env.([^.]+).?([^.]+)?/)
              RegExp.$1 && env.add(RegExp.$1)
            })
            const { [this.options.prefix!]: DYNAMIC_ENV } = readAllDotenvFiles(
              Array.from(env),
              this.options.prefix
            )
            this.options.env = JSON.stringify(DYNAMIC_ENV)
          }

          // 动态创建base标签
          if (this.options.env && this.options.robotUrl) {
            const str = `<script src="${this.options.robotUrl}"></script><script>${this.options.robot}.createInstance(${this.options.env}, {key: "${this.options.robotInstance}", force: ${this.options.force}})</script>`
            data.html = insertStringAfter(data.html, '<head>', str)
          }

          // 动态加载资源
          const { headTags, bodyTags } = data
          data.html = HtmlWebpackMixinRobot.insertRobotFunc(
            data.html,
            headTags,
            'head',
            this.options
          )
          data.html = HtmlWebpackMixinRobot.insertRobotFunc(
            data.html,
            bodyTags,
            'body',
            this.options
          )
          // 清除headTags和bodyTags
          data.headTags = []
          data.bodyTags = []
          return data
        })
    })
  }
}
