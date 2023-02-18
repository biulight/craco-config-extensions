import type { Compiler } from "webpack"
import type HtmlWebpackPlugin from "html-webpack-plugin"
import type { HtmlTagObject } from "html-webpack-plugin"

import { insertStringBefore, insertStringAfter } from "@/utils"

interface Options {
  robot?: string
  robotInstance?: string
  robotUrl?: string
  env?: string
}

export default class HtmlWebpackMixinRobot {
  options: Options
  htmlWebpackPlugin: typeof HtmlWebpackPlugin

  constructor(htmlWebpackPlugin: typeof HtmlWebpackPlugin, options: Options) {
    this.htmlWebpackPlugin = htmlWebpackPlugin
    this.options = {
      robot: "_BIU_LOAD_ROBOT",
      ...options,
    }
  }

  static insertRobotFunc(
    html: string,
    tags: HtmlTagObject[],
    position: string,
    options: Options
  ) {
    if (!tags.length) return html
    const formatTags = tags.map((tag) => {
      const { tagName, attributes } = tag
      return {
        tagName,
        attributes,
      }
    })
    const str = `<script>${options.robot}.loadOrigin(${JSON.stringify(
      formatTags
    )}, "${position}")</script>`
    return insertStringBefore(html, `</${position}>`, str)
  }

  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap("HtmlWebpackMixinRobot", (compilation) => {
      this.htmlWebpackPlugin
        .getHooks(compilation)
        .afterTemplateExecution.tap("HtmlWebpackMixinRobot", (data) => {
          const fs = require("node:fs")
          const path = require("node:path")
          fs.writeFileSync(
            path.join(process.cwd(), "__HtmlWebpackMixinRobot"),
            JSON.stringify(
              data,
              (key, val) => {
                if (Object.prototype.toString.call(val) === "[object RegExp]") {
                  return val.toString()
                }
                return val
              },
              2
            )
          )
          // 动态创建base标签
          if (this.options.env && this.options.robotUrl) {
            const str = `<script src="${this.options.robotUrl}"></script><script>${this.options.robot}.createInstance(${this.options.env}, "${this.options.robotInstance}")</script>`
            data.html = insertStringAfter(data.html, "<head>", str)
          }

          // 动态加载资源
          const { headTags, bodyTags } = data
          data.html = HtmlWebpackMixinRobot.insertRobotFunc(
            data.html,
            headTags,
            "head",
            this.options
          )
          data.html = HtmlWebpackMixinRobot.insertRobotFunc(
            data.html,
            bodyTags,
            "body",
            this.options
          )
          return data
        })
    })
  }
}
