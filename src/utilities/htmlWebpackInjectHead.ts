import type { Compiler } from 'webpack'
import type HtmlWebpackPlugin from 'html-webpack-plugin'
import { insertStringBefore, insertStringAfter } from '@/utils'

interface Options {
  content: string
  position?: 'start' | 'end'
}

export default class HtmlWebpackInjectHead {
  options: Options
  htmlWebpackPlugin: typeof HtmlWebpackPlugin

  constructor (htmlWebpackPlugin: typeof HtmlWebpackPlugin, options: Options) {
    this.htmlWebpackPlugin = htmlWebpackPlugin
    this.options = {
      position: 'start',
      ...options
    }
  }

  apply (compiler: Compiler) {
    compiler.hooks.compilation.tap('HtmlWebpackInjectHead', (compilation) => {
      this.htmlWebpackPlugin
        .getHooks(compilation)
        .beforeEmit.tap('HtmlWebpackInjectHead', (data) => {
          if (this.options.position === 'end') {
            data.html = insertStringBefore(
              data.html,
              '</head>',
              this.options.content
            )
          } else {
            data.html = insertStringAfter(
              data.html,
              '<head>',
              this.options.content
            )
          }
          return data
        })
    })
  }
}
