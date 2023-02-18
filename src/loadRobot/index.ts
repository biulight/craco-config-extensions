import type { HtmlTagObject } from "html-webpack-plugin"

interface HtmlAttributes {
  [attributeName: string]: string | boolean | null | undefined
}

function createTag(
  tagName: string,
  attributes: HtmlAttributes,
  position?: string
) {
  const tag = document.createElement(tagName)
  for (const key in attributes) {
    if (!attributes.hasOwnProperty(key)) continue
    tag.setAttribute(key, attributes[key] as string)
  }
  position && document.getElementsByTagName(position)[0].appendChild(tag)
  return tag
}

class LoadRobot {
  #envConfig: Record<string, string> = {}
  #outlet = ["load"]

  #proxyHandler = {
    get(target: LoadRobot, propKey: string) {
      if (target.#outlet.includes(propKey)) return Reflect.get(target, propKey)
      return target.#envConfig[propKey]
      // return Reflect.get(target, propKey)
    },
  }

  static #permit = false

  constructor(
    options: Record<string, any>,
    key: string = "BIU_LIGHT_ENV_CONFIG"
  ) {
    if (!LoadRobot.#permit)
      throw new Error(
        "LoadRobot only supports instantiation through the static method 'createInstance' "
      )
    // 初始化
    this.#init(options)
    // 挂载
    // @ts-ignore
    window[key] = new Proxy(this, this.#proxyHandler)
    LoadRobot.#permit = false
    // @ts-ignore
    return window[key]
  }

  /**
   * create instance
   */
  static createInstance(
    options: Record<string, any>,
    key = "PAB_BANK_ENV_CONFIG"
  ) {
    // @ts-ignore
    if (window[key]) return window[key]
    this.#permit = true
    return new LoadRobot(options, key)
  }

  #init(options: Record<string, any>) {
    const { hostname } = new URL(window.location.href)
    this.#envConfig = options[hostname] || {}
    const staticDomain = this.#envConfig["STATIC_DOMAIN"]
    this.createBase(staticDomain)
  }
  /**
   * load baseUrl by creating base element
   *
   */
  createBase(url?: string, success?: () => void) {
    if (!url) return
    let baseEle = document.createElement("base")
    baseEle.href = url

    const header = document.getElementsByTagName("head")[0]
    // header.insertBefore(baseEle, document.currentScript!.nextElementSibling)
    header.insertBefore(baseEle, header.firstElementChild)
    // load successfully
    success && success()
  }
  /**
   * load resource by creating tag element
   *
   */
  static load(list: string[]) {
    for (const url of list) {
      if (url.endsWith(".js")) LoadRobot.createScript(url)
      if (url.endsWith(".css")) LoadRobot.createLink(url)
    }
  }

  /**
   * load Webpack Resource
   */
  static loadOrigin(tags: HtmlTagObject[], position: string) {
    const fragment = document.createDocumentFragment()
    for (const tag of tags) {
      const { tagName, attributes } = tag
      fragment.appendChild(createTag(tagName, attributes))
    }
    document.getElementsByTagName(position)[0].appendChild(fragment)
  }

  static createScript(url: string, callback?: Function) {
    let script = document.createElement("script")
    let fn = callback || function () {}
    script.setAttribute("type", "text/javascript")
    // @ts-ignore
    if (script.readyState) {
      // @ts-ignore
      script.onreadystatechange = function () {
        // @ts-ignore
        if (script.readyState == "loaded" || script.readyState == "complete") {
          // @ts-ignore
          script.onreadystatechange = null
          fn()
        }
      }
    } else {
      // 其他现代浏览器
      script.onload = function () {
        fn()
      }
    }

    script.src = url
    document.getElementsByTagName("head")[0].appendChild(script)
  }

  static createLink(url: string) {
    const link = document.createElement("link")
    link.setAttribute("rel", "stylesheet")
    link.setAttribute("type", "text/css")
    link.setAttribute("href", url)
    document.getElementsByTagName("head")[0].appendChild(link)
  }
}

export default LoadRobot
// export default LoadRobot.createInstance({
//   ...process.env.DYNAMIC_ENV
// })
